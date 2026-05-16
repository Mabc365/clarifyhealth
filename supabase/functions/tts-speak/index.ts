import { corsHeaders } from "../_shared/cors.ts";

// Uses Lovable AI Gateway's OpenAI-compatible TTS endpoint.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, voice = "alloy", speed = 1.0 } = await req.json();
    if (!text || typeof text !== "string" || text.length > 4000) {
      return new Response(JSON.stringify({ error: "Text required (max 4000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const key = Deno.env.get("LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "openai/gpt-4o-mini-tts", voice, input: text, speed, response_format: "mp3" }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `TTS ${res.status}: ${errText}` }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const audio = await res.arrayBuffer();
    return new Response(audio, { headers: { ...corsHeaders, "Content-Type": "audio/mpeg" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});