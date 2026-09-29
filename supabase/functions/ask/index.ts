import { requireAiUse } from "../_shared/gate.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── System Prompts ──────────────────────────────────────────────────────────

const PROMPT_DIAGNOSIS = `You are a warm, knowledgeable health educator at Clarify Health. A patient has shared their medical diagnosis, lab results, or doctor's notes with you. Your sole job is to help them understand what it means in plain, simple English — like a trusted friend who happens to know medicine well.

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
This explanation is for general understanding only, not medical advice. Always follow your doctor's guidance.`;

const PROMPT_GENERAL = `You are a warm, knowledgeable health educator at Clarify Health. Answer the health question in plain, simple English at an 8th-grade reading level.

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
This is general health information, not medical advice. Always speak with your doctor.`;

const PROMPT_WELLNESS = `You are a warm, encouraging health educator at Clarify Health. Give honest, practical, sustainable wellness advice with small steps that do not feel overwhelming.

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
This is general wellness information. For personalized advice, speak with your doctor.`;

const PROMPTS: Record<string, string> = {
  diagnosis: PROMPT_DIAGNOSIS,
  general: PROMPT_GENERAL,
  wellness: PROMPT_WELLNESS,
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  ur: "Urdu",
  hi: "Hindi",
  ar: "Arabic",
};

function buildSystemPrompt(mode: string, language: string): string {
  const base = PROMPTS[mode] ?? PROMPTS.general;
  const lang = LANG_NAMES[language] ?? "English";
  return `${base}\n\nRespond in ${lang}.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  { const blocked = await requireAiUse(req, "ask"); if (blocked) return blocked; }

  try {
    const { question, mode, language } = await req.json();

    // Validate input
    if (!question || typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "Question is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (question.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Please keep your input under 2,000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeMode = ["diagnosis", "general", "wellness"].includes(mode) ? mode : "general";
    const safeLang = ["es", "ur", "hi", "ar"].includes(language) ? language : "en";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystemPrompt(safeMode, safeLang) },
          { role: "user", content: question.trim() },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "The AI service is busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ask error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
