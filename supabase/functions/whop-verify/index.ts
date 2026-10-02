import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PLAN_TIERS: Record<string, string> = {
  plan_kZEv2e9b2AKZI: "tier1",
  plan_fmrUm4OGpaGSD: "tier1",
  plan_nHSGuYgKRbIQR: "tier2",
};

const ACTIVE_STATUSES = new Set(["active", "trialing", "completed", "past_due"]);

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
    if (!user || !user.email) return json({ error: "UNAUTHORIZED" }, 401);
    const email = user.email.toLowerCase();

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

    let matched: Record<string, unknown> | null = null;

    // Fastest path: we already know this user's Whop membership id.
    const { data: sub } = await admin.from("subscriptions").select("whop_membership_id").eq("user_id", user.id).maybeSingle();
    const knownId = sub?.whop_membership_id ? String(sub.whop_membership_id) : null;
    if (knownId) {
      const r = await fetch(`https://api.whop.com/api/v1/memberships/${knownId}`, { headers });
      if (r.ok) matched = await r.json().catch(() => null);
    }

    // Fallback: scan each plan's memberships and match by email (needs member:email:read on the key).
    if (!matched) {
      for (const planId of Object.keys(PLAN_TIERS)) {
        const u = new URL("https://api.whop.com/api/v1/memberships");
        u.searchParams.set("plan_id", planId);
        u.searchParams.set("per_page", "100");
        const r = await fetch(u, { headers });
        if (!r.ok) { console.error("Whop list error", r.status, await r.text().catch(() => "")); continue; }
        const body = await r.json().catch(() => ({}));
        const list: Record<string, unknown>[] = Array.isArray(body) ? body : body.data ?? [];
        matched = list.find((m) => {
          const member = m.member as Record<string, unknown> | undefined;
          const e = String(member?.email ?? (m.user as Record<string, unknown> | undefined)?.email ?? m.email ?? "").toLowerCase();
          return e && e === email;
        }) ?? null;
        if (matched) break;
      }
    }

    if (!matched) return json({ synced: false, reason: "no_membership" });

    const planId = String(matched.plan_id ?? (matched.plan as Record<string, unknown> | undefined)?.id ?? "");
    const tier = PLAN_TIERS[planId];
    const status = String(matched.status ?? "");
    // Canceled members keep access until their paid period ends.
    const periodEndRaw = matched.current_period_end ?? matched.renewal_period_end ?? matched.valid_until ?? null;
    const periodEnd = periodEndRaw ? new Date(typeof periodEndRaw === "number" ? periodEndRaw * 1000 : String(periodEndRaw)) : null;
    const withinPaidPeriod = !!periodEnd && periodEnd.getTime() > Date.now();
    const isActive = ACTIVE_STATUSES.has(status) || (status === "canceled" && withinPaidPeriod);
    if (!tier) return json({ synced: false, reason: "unknown_plan" });

    const { error } = await admin.from("subscriptions").upsert({
      user_id: user.id,
      plan_id: planId,
      tier: isActive ? tier : "free",
      status: isActive ? "active" : "inactive",
      whop_membership_id: matched.id ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) { console.error(error); return json({ error: "DB_ERROR" }, 500); }

    return json({
      synced: true,
      tier: isActive ? tier : "free",
      status: isActive ? "active" : "inactive",
      membership_id: matched.id ?? null,
      renewal_period_end: matched.current_period_end ?? matched.renewal_period_end ?? null,
      cancel_at_period_end: !!matched.cancel_at_period_end,
    });
  } catch (e) {
    console.error(e);
    return json({ error: "SERVER_ERROR" }, 500);
  }
});
