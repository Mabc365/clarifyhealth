import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("WHOP_API_KEY");
    if (!apiKey) return json({ error: "NOT_CONFIGURED" }, 500);
    const auth = req.headers.get("Authorization") ?? "";
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ error: "UNAUTHORIZED" }, 401);

    const { action } = await req.json().catch(() => ({}));
    if (!["get", "cancel", "resume"].includes(action)) return json({ error: "BAD_ACTION" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sub } = await admin.from("subscriptions").select("whop_membership_id").eq("user_id", user.id).maybeSingle();
    const id = sub?.whop_membership_id;
    if (!id) return json({ error: "NO_MEMBERSHIP" }, 404);

    const base = `https://api.whop.com/api/v1/memberships/${id}`;
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    let r: Response;
    if (action === "cancel") r = await fetch(`${base}/cancel`, { method: "POST", headers, body: JSON.stringify({ cancellation_mode: "at_period_end" }) });
    else if (action === "resume") r = await fetch(`${base}/uncancel`, { method: "POST", headers });
    else r = await fetch(base, { headers });
    const m = await r.json().catch(() => ({}));
    if (!r.ok) { console.error("Whop API error", r.status, m); return json({ error: "WHOP_ERROR" }, 502); }

    return json({
      status: m.status ?? null,
      plan: m.plan?.id ?? null,
      renewal_period_end: m.renewal_period_end ?? null,
      cancel_at_period_end: !!m.cancel_at_period_end,
      manage_url: m.manage_url ?? "https://whop.com/orders",
    });
  } catch (e) {
    console.error(e);
    return json({ error: "SERVER_ERROR" }, 500);
  }
});
