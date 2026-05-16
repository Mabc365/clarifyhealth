import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://clarifyhealth.co";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await supabase
      .from("articles")
      .select("slug,title,summary,tldr,updated_at,language")
      .eq("language", "en")
      .order("updated_at", { ascending: false })
      .limit(100);

    const items = (data ?? []).map((a: any) => {
      const desc = a.summary || (a.tldr && a.tldr[0]) || "";
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE_URL}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
      <description>${esc(desc)}</description>
      <pubDate>${new Date(a.updated_at).toUTCString()}</pubDate>
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Clarify Health</title>
    <link>${SITE_URL}</link>
    <description>Plain-English health explainers — no jargon, no confusion.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, { headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  } catch (e) {
    return new Response(`Error: ${String(e)}`, { status: 500, headers: corsHeaders });
  }
});