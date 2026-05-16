import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { article_slug, problem_type, description, reporter_email } = await req.json();
    if (!article_slug || !problem_type || !description) {
      return json({ error: "Missing fields" }, 400);
    }
    if (typeof description !== "string" || description.length > 2000) {
      return json({ error: "Description too long" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("problem_reports").insert({
      article_slug, problem_type, description, reporter_email: reporter_email || null,
    });
    if (dbError) console.error("DB insert failed:", dbError);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (LOVABLE_API_KEY && RESEND_API_KEY) {
      const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));
      await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "Clarify Health <onboarding@resend.dev>",
          to: ["clarifyhlth@gmail.com"],
          subject: `[Report] ${problem_type} — /article/${article_slug}`,
          html: `<h2>Problem report</h2>
            <p><strong>Article:</strong> /article/${esc(article_slug)}</p>
            <p><strong>Type:</strong> ${esc(problem_type)}</p>
            <p><strong>Description:</strong></p>
            <p>${esc(description).replace(/\n/g, "<br>")}</p>
            <p><strong>Reporter:</strong> ${reporter_email ? esc(reporter_email) : "(anonymous)"}</p>`,
        }),
      }).catch((e) => console.error("Resend failed:", e));
    }

    return json({ success: true }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}