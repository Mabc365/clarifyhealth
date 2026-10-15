// Vercel serverless endpoint: POST /api/ai/{name}
// Staging-only replacement for the Lovable-hosted AI edge functions. Only used
// when the frontend is built with VITE_AI_BACKEND=vercel (see docs/vercel-ai-migration.md).
//
// Order of operations per request (prevents charging for bad input):
//   1. method / feature name / body size checks
//   2. verify bearer JWT against EXTERNAL_SUPABASE_URL
//   3. validate + normalise input
//   4. consume_ai_use RPC (service role, server-side only)  ← single charge
//   5. call OpenAI; on upstream failure, refund the usage row (best effort)
//
// Never log request bodies, transcripts, audio or model output (medical content).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const config = { maxDuration: 60 };

const OPENAI = "https://api.openai.com/v1";
const MAX_BODY_BYTES = 4 * 1024 * 1024; // Vercel hard limit is 4.5 MB
const DISCLAIMER =
  "This is general health information, not medical advice. Talk to your doctor about your situation.";
const LANG_NAMES: Record<string, string> = { en: "English", es: "Spanish", ur: "Urdu", hi: "Hindi", ar: "Arabic" };
const VOICES = new Set(["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer", "verse"]);

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const clean = (v: string | undefined) => (v ?? "").replace(/[^\x21-\x7E]/g, "");
const env = (k: string) => clean(process.env[k]);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

// ── Prompts (copied from supabase/functions/* so contracts match) ─────────

const ASK_PROMPTS: Record<string, string> = {
  diagnosis: `You are a warm, knowledgeable health educator at Clarify Health. A patient has shared their medical diagnosis, lab results, or doctor's notes with you. Your sole job is to help them understand what it means in plain, simple English — like a trusted friend who happens to know medicine well.

STRICT RULES:
- Write at an 8th-grade reading level at all times
- Never use medical jargon without immediately defining it in plain English
- Never contradict or override the doctor's instructions
- Never diagnose anything beyond what is already stated in the input
- Never suggest stopping or changing medications
- Be calm and reassuring — receiving a diagnosis is frightening
- Keep total response under 400 words

FORMAT your response exactly like this:

**What your doctor found**
Explain the diagnosis or result in 2-3 plain sentences. If it is a number, explain what normal looks like and where the patient falls.

**What this means for your daily life**
2-3 sentences on practical day-to-day impact.

**What typically happens next**
3 bullet points of common next steps phrased as what often happens, not instructions.

**Questions to bring to your doctor**
3 specific questions a patient would actually say out loud.

**Learn more from trusted sources**
2-3 real URLs from CDC, Mayo Clinic, NIH MedlinePlus, AHA, or ADA relevant to this diagnosis. Format as: Source Name — full URL

---
This explanation is for general understanding only, not medical advice. Always follow your doctor's guidance.`,
  general: `You are a warm, knowledgeable health educator at Clarify Health. Answer the health question in plain, simple English at an 8th-grade reading level.

STRICT RULES:
- Never use jargon without explaining it immediately
- Never diagnose the person asking
- Be warm, calm, never alarmist
- Keep total response under 300 words

FORMAT:
**The short answer** — 1-2 sentences, the most important thing to know.
**A bit more detail** — 3-4 sentences expanding on the answer.
**Practical steps** — 3 small, doable bullet points.
**When to see a doctor** — 1-2 sentences on when to get checked out.
**Trusted sources** — 2 real URLs from CDC, Mayo Clinic, NIH MedlinePlus, AHA, or ADA. Format as: Source Name — full URL
---
This is general health information, not medical advice. Always speak with your doctor.`,
  wellness: `You are a warm, encouraging health educator at Clarify Health. Give honest, practical, sustainable wellness advice with small steps that do not feel overwhelming.

STRICT RULES:
- 8th-grade reading level
- Small sustainable changes only — never extreme advice
- Never judgmental about current habits
- Never recommend specific supplements or medications
- Keep total response under 300 words

FORMAT:
**The honest truth about [topic]** — 2-3 sentences on what actually works.
**3 small steps to start this week** — genuinely small, specific, doable actions with one sentence each.
**What to expect** — 2 sentences on realistic timelines.
**One thing to avoid** — 1 common mistake and why.
**Trusted sources** — 2 real URLs from CDC, NIH MedlinePlus, or Mayo Clinic. Format as: Source Name — full URL
---
This is general wellness information. For personalized advice, speak with your doctor.`,
};

const WELLNESS_SYSTEM = `You are a certified wellness coach and health educator for Clarify Health. You create personalized, evidence-based wellness plans.

RULES:
- Write at an 8th-grade reading level
- Never diagnose or prescribe medications
- Never contradict existing medical treatments
- Be culturally sensitive to dietary and spiritual preferences
- Cite real sources (NIH, Mayo Clinic, Harvard Health, PubMed, WHO) formatted as "source name — URL"
- Be practical and actionable — focus on small, achievable steps
- Only fill supplements/mindfulness (applicable=true) if relevant to the user's selections.`;

const visitPrompt = (langName: string) => `You are a medical analysis assistant at Clarify Health. The user gives you raw doctor visit notes or a transcript. Extract a structured plain-English breakdown, written in ${langName}.
- summary: 2-4 plain-English sentences at an 8th-grade reading level.
Never invent details. Return [] or "" for anything you cannot fill.`;

const transcriptPrompt = (langName: string) => `You are a medical transcription and analysis assistant at Clarify Health. You receive the raw text transcript of a doctor's visit recording.
Split it into speaker turns. The one who sounds like a clinician (medical vocabulary, diagnostic questions, instructions) is "Doctor"; the other is "Patient". If you cannot tell, use "Speaker 1" / "Speaker 2". Keep the original wording of each turn; set start to 0 when unknown.
Then extract a structured breakdown written in ${langName}; summary is 2-4 plain-English sentences at an 8th-grade reading level.
Never invent details. Return [] or "" for anything you cannot fill.`;

// ── Strict JSON schemas ───────────────────────────────────────────────────

const S = { type: "string" } as const;
const arr = (items: unknown) => ({ type: "array", items });
const obj = (properties: Record<string, unknown>) => ({
  type: "object", properties, required: Object.keys(properties), additionalProperties: false,
});

const visitProps = {
  summary: S,
  structured: obj({
    diagnosis: S,
    medications: arr(obj({ name: S, dose: S, frequency: S, purpose: S })),
    tests_ordered: arr(S),
    follow_ups: arr(obj({ what: S, when: S })),
    red_flags: arr(S),
  }),
  follow_up_questions: arr(S),
  key_terms: arr(obj({ term: S, definition: S })),
};
const SCHEMAS = {
  jargon: obj({ plain_english: S, terms: arr(obj({ term: S, definition: S })) }),
  symptom: obj({
    what_it_might_relate_to: S, things_to_track: arr(S), self_care_tips: arr(S),
    when_to_see_doctor: arr(S), red_flags: arr(S),
  }),
  wellness: obj({
    nutrition: obj({ summary: S, recommendations: arr(S), sources: arr(S) }),
    exercise: obj({ summary: S, recommendations: arr(S), sources: arr(S) }),
    stressSleep: obj({ summary: S, recommendations: arr(S), sources: arr(S) }),
    supplements: obj({ applicable: { type: "boolean" }, summary: S, recommendations: arr(S), disclaimer: S, sources: arr(S) }),
    mindfulness: obj({ applicable: { type: "boolean" }, summary: S, recommendations: arr(S), sources: arr(S) }),
  }),
  visit: obj(visitProps),
  transcript: obj({ transcript: arr(obj({ speaker: S, text: S, start: { type: "number" } })), ...visitProps }),
};

// ── OpenAI helpers ────────────────────────────────────────────────────────

function openaiKey() {
  const k = env("OPENAI_API_KEY");
  if (!k) throw new HttpError(500, "AI service is not configured.");
  return k;
}

function mapUpstream(status: number): HttpError {
  if (status === 429) return new HttpError(429, "The AI service is busy right now. Please try again in a moment.");
  if (status === 401 || status === 403) return new HttpError(502, "AI service is not available right now.");
  if (status === 400) return new HttpError(502, "The AI service could not process this request.");
  return new HttpError(502, "Something went wrong. Please try again.");
}

async function respond(opts: {
  instructions: string;
  input: string;
  promptEnv?: "CLARIFY_CORE_PROMPT_ID" | "CLARIFY_ANALYSIS_PROMPT_ID";
  schema?: { name: string; schema: unknown };
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: env("OPENAI_MODEL") || "gpt-4.1-mini",
    instructions: opts.instructions,
    input: opts.input,
    store: false,
  };
  const promptId = opts.promptEnv ? env(opts.promptEnv) : "";
  if (promptId) body.prompt = { id: promptId };
  if (opts.schema) body.text = { format: { type: "json_schema", name: opts.schema.name, schema: opts.schema.schema, strict: true } };

  const res = await fetch(`${OPENAI}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("openai responses error", res.status); // status only, no content
    throw mapUpstream(res.status);
  }
  const data = await res.json();
  let text = "";
  for (const item of data.output ?? []) {
    for (const c of item.content ?? []) {
      if (c.type === "refusal") throw new HttpError(422, "The AI could not answer this request.");
      if (c.type === "output_text") text += c.text;
    }
  }
  if (!text.trim()) throw new HttpError(502, "The AI returned an empty answer. Please try again.");
  return text;
}

const parseJson = (raw: string) => {
  try { return JSON.parse(raw); } catch { throw new HttpError(502, "The AI returned an unreadable answer. Please try again."); }
};

// ── Input validation (runs BEFORE charging) ───────────────────────────────

const str = (v: unknown, max: number, msg: string) => {
  if (typeof v !== "string" || !v.trim() || v.length > max) throw new HttpError(400, msg);
  return v.trim();
};
const lang = (v: unknown) => (typeof v === "string" && LANG_NAMES[v] ? v : "en");
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => x.slice(0, 100)).slice(0, 20) : []);
const short = (v: unknown) => (typeof v === "string" ? v.slice(0, 500) : "");

type Prepared = () => Promise<Response>;

function prepare(name: string, body: any): Prepared {
  switch (name) {
    case "ask": {
      const question = str(body.question, 2000, "Please keep your input under 2,000 characters.");
      const mode = ["diagnosis", "general", "wellness"].includes(body.mode) ? body.mode : "general";
      const l = LANG_NAMES[lang(body.language)];
      return async () => {
        const answer = await respond({ instructions: `${ASK_PROMPTS[mode]}\n\nRespond in ${l}.`, input: question, promptEnv: "CLARIFY_CORE_PROMPT_ID" });
        return json({ answer });
      };
    }
    case "jargon-translate": {
      const text = str(body.text, 8000, "Provide text up to 8000 chars");
      return async () => {
        const raw = await respond({
          instructions: "You translate confusing medical text into plain, friendly English at a 6th-grade reading level. Never diagnose. plain_english: a clear rewrite (short paragraphs, no jargon). terms: every medical/insurance term you noticed in the original, each with a 1-sentence plain definition.",
          input: text, promptEnv: "CLARIFY_CORE_PROMPT_ID", schema: { name: "jargon", schema: SCHEMAS.jargon },
        });
        return json({ ...parseJson(raw), disclaimer: DISCLAIMER });
      };
    }
    case "eli5-rewrite": {
      const text = str(body.text, 8000, "Text required (max 8000 chars)");
      const grade = body.mode === "eli5" ? "a curious 10-year-old (3rd grade reading level)" : "a 6th-8th grade reader";
      return async () => {
        const out = await respond({
          instructions: `Rewrite the following health text so it is clearly understandable by ${grade}.\nKeep the same medical meaning, but use short sentences, everyday words, and a friendly tone. No diagnosis. End with the disclaimer line: "${DISCLAIMER}"`,
          input: text, promptEnv: "CLARIFY_CORE_PROMPT_ID",
        });
        return json({ text: out, disclaimer: DISCLAIMER });
      };
    }
    case "symptom-explain": {
      const description = str(body.description, 4000, "Describe your symptoms (under 4000 chars)");
      return async () => {
        const raw = await respond({
          instructions: `You are an educational health explainer. You DO NOT diagnose. You explain what symptoms generally relate to in the body, in plain 6th-grade English.
- what_it_might_relate_to: 2-4 sentences, general body system context
- things_to_track: 3-6 bullets the user can note for their doctor
- self_care_tips: 3-5 general comfort tips, no medications
- when_to_see_doctor: 3-6 non-urgent reasons to schedule a visit
- red_flags: emergency signs that mean call 911 / go to ER NOW
Never name a specific diagnosis. Use phrases like "this may relate to" or "this is often seen with".`,
          input: description, promptEnv: "CLARIFY_CORE_PROMPT_ID", schema: { name: "symptom", schema: SCHEMAS.symptom },
        });
        return json({ ...parseJson(raw), disclaimer: DISCLAIMER });
      };
    }
    case "wellness-plan": {
      const p = body.preferences;
      if (!p || typeof p !== "object" || Array.isArray(p)) throw new HttpError(400, "Preferences required");
      const l = LANG_NAMES[lang(body.language)];
      const input = `Create a personalized wellness plan for this person. Respond in ${l}.

Profile:
- Age range: ${short(p.ageRange) || "not specified"}
- Health goals: ${strList(p.healthGoals).join(", ") || "general wellness"}
- Diagnosed conditions: ${short(p.conditions) || "none specified"}
- Diet preferences: ${strList(p.dietPreferences).join(", ") || "no restrictions"}
- Activity level: ${short(p.activityLevel) || "not specified"}
- Physical limitations: ${short(p.limitations) || "none"}
- Openness to holistic approaches: ${strList(p.holisticPreferences).join(", ") || "no preference"}

Important: Respect all dietary and spiritual preferences. If they selected Halal, Kosher, Ayurveda, Islamic medicine, etc., incorporate those respectfully.`;
      return async () => {
        const raw = await respond({ instructions: WELLNESS_SYSTEM, input, promptEnv: "CLARIFY_CORE_PROMPT_ID", schema: { name: "wellness_plan", schema: SCHEMAS.wellness } });
        return json({ plan: parseJson(raw) });
      };
    }
    case "analyze-visit": {
      const text = str(body.text, 20000, "text is required (max 20000 chars)");
      const l = LANG_NAMES[lang(body.language)];
      return async () => {
        const raw = await respond({ instructions: visitPrompt(l), input: text, promptEnv: "CLARIFY_ANALYSIS_PROMPT_ID", schema: { name: "visit", schema: SCHEMAS.visit } });
        return json(parseJson(raw));
      };
    }
    case "transcribe-audio": {
      const b64 = str(body.audioBase64, MAX_BODY_BYTES, "audioBase64 is required");
      const mime = typeof body.mimeType === "string" ? body.mimeType.toLowerCase() : "audio/webm";
      const ext = mime.includes("wav") ? "wav" : mime.includes("ogg") ? "ogg" : mime.includes("mpeg") || mime.includes("mp3") ? "mp3"
        : mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac") ? "m4a" : mime.includes("flac") ? "flac" : "webm";
      const audio = Buffer.from(b64, "base64");
      if (audio.length < 1000) throw new HttpError(400, "Recording is empty or too short.");
      const l = lang(body.language);
      return async () => {
        // Real speech-to-text first; the audio itself is never sent as text.
        const form = new FormData();
        form.append("file", new Blob([audio], { type: mime }), `visit.${ext}`);
        form.append("model", env("OPENAI_TRANSCRIBE_MODEL") || "gpt-4o-transcribe");
        form.append("response_format", "json");
        const tr = await fetch(`${OPENAI}/audio/transcriptions`, { method: "POST", headers: { Authorization: `Bearer ${openaiKey()}` }, body: form });
        if (!tr.ok) { console.error("openai transcription error", tr.status); throw mapUpstream(tr.status); }
        const transcriptText = String((await tr.json()).text ?? "").trim();
        if (!transcriptText) throw new HttpError(422, "No speech was detected in the recording.");
        const raw = await respond({
          instructions: transcriptPrompt(LANG_NAMES[l]), input: transcriptText.slice(0, 60000),
          promptEnv: "CLARIFY_ANALYSIS_PROMPT_ID", schema: { name: "visit_transcript", schema: SCHEMAS.transcript },
        });
        parseJson(raw); // ensure valid before returning
        return json({ answer: raw }); // contract: { answer: <JSON string> }
      };
    }
    case "tts-speak": {
      const text = str(body.text, 4000, "Text required (max 4000 chars)");
      const voice = VOICES.has(body.voice) ? body.voice : "alloy";
      const speed = Math.min(4, Math.max(0.25, Number(body.speed) || 1));
      return async () => {
        const res = await fetch(`${OPENAI}/audio/speech`, {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: env("OPENAI_TTS_MODEL") || "gpt-4o-mini-tts", voice, input: text, speed, response_format: "mp3" }),
        });
        if (!res.ok) { console.error("openai speech error", res.status); throw mapUpstream(res.status); }
        return new Response(await res.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
      };
    }
    default:
      throw new HttpError(404, "Unknown AI function");
  }
}

// ── Auth + usage gate ─────────────────────────────────────────────────────

function adminClient(): SupabaseClient {
  const url = env("EXTERNAL_SUPABASE_URL");
  const key = env("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new HttpError(500, "Server is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function authenticate(admin: SupabaseClient, req: Request): Promise<string> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new HttpError(401, "LOGIN_REQUIRED");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, "LOGIN_REQUIRED");
  return data.user.id;
}

async function charge(admin: SupabaseClient, userId: string, feature: string) {
  const { data, error } = await admin.rpc("consume_ai_use", { _user_id: userId, _feature: feature });
  if (error) { console.error("consume_ai_use failed", error.code); throw new HttpError(500, "Server error"); }
  if (!data?.allowed) return json({ error: "LIMIT_REACHED", ...data }, 403);
  return null;
}

// Best-effort refund when the upstream AI call fails after charging.
async function refund(admin: SupabaseClient, userId: string, feature: string, since: string) {
  const { data } = await admin.from("ai_usage").select("id").eq("user_id", userId).eq("feature", feature)
    .gte("created_at", since).order("created_at", { ascending: false }).limit(1);
  const id = data?.[0]?.id;
  if (id !== undefined) await admin.from("ai_usage").delete().eq("id", id);
}

// ── Handler ───────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const name = decodeURIComponent(new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "");
  try {
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_BODY_BYTES) throw new HttpError(413, "Request too large (max 4 MB on this backend).");

    const admin = adminClient();
    const userId = await authenticate(admin, req);

    let body: any;
    try { body = await req.json(); } catch { throw new HttpError(400, "Invalid JSON body"); }
    if (!body || typeof body !== "object") throw new HttpError(400, "Invalid JSON body");

    const run = prepare(name, body); // validates; throws 400/404 before any charge

    const since = new Date(Date.now() - 5000).toISOString();
    const blocked = await charge(admin, userId, name);
    if (blocked) return blocked;

    try {
      return await run();
    } catch (e) {
      await refund(admin, userId, name, since).catch(() => console.error("refund failed"));
      throw e;
    }
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error("ai handler error", name, (e as Error)?.name);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

export function GET() {
  return json({ error: "Method not allowed" }, 405);
}
