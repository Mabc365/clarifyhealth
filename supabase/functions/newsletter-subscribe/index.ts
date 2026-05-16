import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://clarifyhealth.co";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, language = "en" } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    // Upsert subscriber as pending
    const { data: existing } = await supabase.from("newsletter_subscribers").select("status, confirmation_token").eq("email", email).maybeSingle();
    let confirmationToken = token;
    if (existing) {
      if (existing.status === "confirmed") {
        return new Response(JSON.stringify({ ok: true, alreadyConfirmed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      confirmationToken = existing.confirmation_token;
      await supabase.from("newsletter_subscribers").update({ status: "pending", language }).eq("email", email);
    } else {
      await supabase.from("newsletter_subscribers").insert({ email, confirmation_token: token, language, status: "pending" });
    }

    const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${confirmationToken}`;

    // Send via Resend gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("Missing Resend credentials");
      return new Response(JSON.stringify({ error: "Email not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1B2A24;background:#FAF8F3">
        <h1 style="font-family:Georgia,serif;color:#1a6b4a;font-size:24px;margin:0 0 16px">Confirm your subscription</h1>
        <p style="font-size:16px;line-height:1.7">Thanks for signing up for Clarify Health — one plain-English health explainer in your inbox each week.</p>
        <p style="font-size:16px;line-height:1.7">Click the button below to confirm your email:</p>
        <p style="margin:24px 0"><a href="${confirmUrl}" style="background:#1a6b4a;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Confirm my subscription</a></p>
        <p style="font-size:13px;color:#666;line-height:1.6">If you didn't sign up, you can ignore this email. We'll never share your address.</p>
      </div>`;

    const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Clarify Health <onboarding@resend.dev>",
        to: [email],
        subject: "Confirm your Clarify Health subscription",
        html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("Resend error:", r.status, t);
      return new Response(JSON.stringify({ error: "Failed to send confirmation email" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});