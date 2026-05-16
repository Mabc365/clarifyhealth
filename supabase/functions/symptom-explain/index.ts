import { corsHeaders, DISCLAIMER } from "../_shared/cors.ts";
import { aiChat } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.length > 4000) {
      return new Response(JSON.stringify({ error: "Describe your symptoms (under 4000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const system = `You are an educational health explainer. You DO NOT diagnose. You explain what symptoms generally relate to in the body, in plain 6th-grade English.
Return STRICT JSON:
{
  "what_it_might_relate_to": string,         // 2-4 sentences, general body system context
  "things_to_track": string[],               // 3-6 bullets the user can note for their doctor
  "self_care_tips": string[],                // 3-5 general comfort tips, no medications
  "when_to_see_doctor": string[],            // 3-6 bullets — non-urgent reasons to schedule a visit
  "red_flags": string[]                      // emergency signs that mean call 911 / go to ER NOW
}
Never name a specific diagnosis. Use phrases like "this may relate to" or "this is often seen with".`;
    const raw = await aiChat({ system, user: description, json: true });
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = { what_it_might_relate_to: raw }; }
    parsed.disclaimer = DISCLAIMER;
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});