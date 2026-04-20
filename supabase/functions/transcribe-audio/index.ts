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

    const systemPrompt = `You are a medical transcription and summarization assistant at Clarify Health. The user has uploaded a recording of a doctor's visit.

1. Transcribe the audio.
2. Then summarize what was discussed in plain English at an 8th-grade reading level.
3. Never invent details. If something is unclear, say so.

Respond in ${langName}. Format your response EXACTLY like this (use markdown):

**Visit summary**
2-4 sentences describing what was discussed.

**Key points**
- Bullet 1
- Bullet 2
- Bullet 3

**Next steps**
- Step 1
- Step 2

**Questions to ask at follow-up**
- Question 1
- Question 2
- Question 3

**Full transcript**
The verbatim transcript of the recording.

---
This summary is for general understanding only, not medical advice. Always follow your doctor's guidance.`;

    const dataUrl = `data:${mimeType || "audio/mpeg"};base64,${audioBase64}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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