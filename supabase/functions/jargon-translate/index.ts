import { corsHeaders, DISCLAIMER } from "../_shared/cors.ts";
import { aiChat } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length > 8000) {
      return new Response(JSON.stringify({ error: "Provide text up to 8000 chars" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const system = `You translate confusing medical text into plain, friendly English at a 6th-grade reading level. Never diagnose. Always end with the disclaimer.
Return STRICT JSON: {"plain_english": string, "terms": [{"term": string, "definition": string}]}.
- plain_english: a clear rewrite (short paragraphs, no jargon).
- terms: every medical/insurance term you noticed in the original, each with a 1-sentence plain definition.`;
    const raw = await aiChat({ system, user: text, json: true });
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = { plain_english: raw, terms: [] }; }
    parsed.disclaimer = DISCLAIMER;
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});