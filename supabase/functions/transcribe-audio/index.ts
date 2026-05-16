import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  ur: "Urdu",
  hi: "Hindi",
  ar: "Arabic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioBase64, mimeType, language } = await req.json();

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return new Response(JSON.stringify({ error: "audioBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeLang = ["en", "es", "ur", "hi", "ar"].includes(language) ? language : "en";
    const langName = LANG_NAMES[safeLang];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a medical transcription and analysis assistant at Clarify Health. The user uploaded a recording of a doctor's visit.

Transcribe the audio AND extract a structured breakdown. Identify two speakers when possible — the one who sounds like a clinician (medical vocabulary, asking diagnostic questions, giving instructions) is "Doctor"; the other is "Patient". If you cannot tell, use "Speaker 1" / "Speaker 2". Never invent details. If something is unclear, say so.

Respond ONLY with a single JSON object (no prose, no code fences) in this exact shape, written in ${langName}:

{
  "transcript": [
    { "speaker": "Doctor" | "Patient" | "Speaker 1" | "Speaker 2", "text": "...", "start": <seconds, number, may be 0> }
  ],
  "summary": "2-4 plain-English sentences at an 8th-grade reading level.",
  "structured": {
    "diagnosis": "string or empty",
    "medications": [ { "name": "", "dose": "", "frequency": "", "purpose": "" } ],
    "tests_ordered": [ "" ],
    "follow_ups": [ { "what": "", "when": "" } ],
    "red_flags": [ "" ]
  },
  "follow_up_questions": [ "Question 1", "Question 2", "Question 3" ],
  "key_terms": [ { "term": "", "definition": "plain-English" } ]
}

Return [] for any list you cannot fill. Return "" for any string you cannot fill. Output must be valid JSON.`;

    const dataUrl = `data:${mimeType || "audio/mpeg"};base64,${audioBase64}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Please transcribe and summarize this doctor visit recording." },
              { type: "input_audio", input_audio: { data: dataUrl, format: mimeType?.includes("wav") ? "wav" : "mp3" } },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const answer = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});