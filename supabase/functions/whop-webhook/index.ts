import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PLAN_TIERS: Record<string, string> = {
  plan_kZEv2e9b2AKZI: "tier1",
  plan_fmrUm4OGpaGSD: "tier1",
  plan_nHSGuYgKRbIQR: "tier2",
};

// Standard Webhooks signature check (used by Whop).
async function verify(secret: string, id: string, ts: string, body: string, sigHeader: string) {
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const keys: Uint8Array[] = [new TextEncoder().encode(secret), new TextEncoder().encode(raw)];
  try { keys.push(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))); } catch { /* not base64 */ }
  const sigs = sigHeader.split(" ").map((s) => s.split(",")[1] ?? s);
  for (const kb of keys) {
    const key = await crypto.subtle.importKey("raw", kb, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`));
    const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
    if (sigs.includes(expected)) return true;
  }
  return false;
}
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("WHOP_WEBHOOK_SECRET");
  if (!secret) { console.error("WHOP_WEBHOOK_SECRET missing"); return new Response("Not configured", { status: 500 }); }
  const body = await req.text();
  const ok = await verify(
    secret,
    req.headers.get("webhook-id") ?? "",
    req.headers.get("webhook-timestamp") ?? "0",
    body,
    req.headers.get("webhook-signature") ?? "",
  );
  if (!ok) { console.warn("Invalid signature", { hasId: !!req.headers.get("webhook-id"), headers: [...req.headers.keys()] }); return new Response("Invalid signature", { status: 401 }); }

  const event = JSON.parse(body);
  const type: string = event.type ?? event.action ?? "";
  const m = event.data ?? {};
  const planId: string = m.plan?.id ?? m.plan_id ?? m.membership?.plan?.id ?? m.product?.plan_id ?? "";
  const email: string = (m.user?.email ?? m.email ?? m.member?.email ?? m.membership?.user?.email ?? "").toLowerCase();
  const tier = PLAN_TIERS[planId];
  console.log("Whop event", { type, planId, hasEmail: !!email, dataKeys: Object.keys(m), userKeys: Object.keys(m.user ?? {}) });
  if (!tier || !email) return new Response("Ignored", { status: 200 });

  let status: string | null = null;
  if (/membership[._]?(activated|went_valid)/.test(type) || /payment[._]succeeded/.test(type)) status = "active";
  if (/membership[._]?(deactivated|went_invalid)/.test(type)) status = "inactive";
  if (!status) return new Response("Ignored", { status: 200 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  // Find the signed-up account with the same email.
  let userId: string | null = null;
  for (let page = 1; page <= 20 && !userId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) { console.error(error); break; }
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (data.users.length < 1000) break;
  }
  if (!userId) { console.warn("No account for Whop email"); return new Response("No matching user", { status: 200 }); }

  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId, plan_id: planId, tier: status === "active" ? tier : "free", status,
    whop_membership_id: m.membership?.id ?? m.id ?? null, updated_at: new Date().toISOString(),
  });
  if (error) { console.error(error); return new Response("DB error", { status: 500 }); }
  return new Response("ok", { status: 200 });
});
