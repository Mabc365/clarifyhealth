import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: sub } = await supabase.from("newsletter_subscribers").select("id, status").eq("confirmation_token", token).maybeSingle();
    if (!sub) return new Response(JSON.stringify({ error: "Token not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (sub.status === "confirmed") return new Response(JSON.stringify({ ok: true, already: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    await supabase.from("newsletter_subscribers").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", sub.id);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});