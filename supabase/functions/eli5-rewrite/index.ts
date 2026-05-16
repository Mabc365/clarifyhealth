import { corsHeaders, DISCLAIMER } from "../_shared/cors.ts";
import { aiChat } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, mode } = await req.json();
    if (!text || typeof text !== "string" || text.length > 8000) {
      return new Response(JSON.stringify({ error: "Text required (max 8000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const targetGrade = mode === "eli5" ? "a curious 10-year-old (3rd grade reading level)" : "a 6th-8th grade reader";
    const system = `Rewrite the following health text so it is clearly understandable by ${targetGrade}.
Keep the same medical meaning, but use short sentences, everyday words, and a friendly tone. No diagnosis. End with the disclaimer line.`;
    const out = await aiChat({ system, user: text });
    return new Response(JSON.stringify({ text: out, disclaimer: DISCLAIMER }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});