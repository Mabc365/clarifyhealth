import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://clarifyhealth.co";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://dojcuaoydegwqrzldtmp.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvamN1YW95ZGVnd3FyemxkdG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTkyMjYsImV4cCI6MjA5MDUzNTIyNn0.VE3uTke-6KF5QEQ5TkeNKioOew4FiPfUqHfRHHJLrAQ";

const staticEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/topics", changefreq: "weekly", priority: "0.9" },
  { path: "/ask", changefreq: "monthly", priority: "0.8" },
  { path: "/translate", changefreq: "monthly", priority: "0.8" },
  { path: "/symptoms", changefreq: "monthly", priority: "0.8" },
  { path: "/glossary", changefreq: "weekly", priority: "0.8" },
  { path: "/find-a-doctor", changefreq: "monthly", priority: "0.7" },
  { path: "/wellness-plan", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/editorial-standards", changefreq: "monthly", priority: "0.6" },
  { path: "/reviewers", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.4" },
  { path: "/newsletter", changefreq: "monthly", priority: "0.6" },
  { path: "/accessibility", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
];

type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };

async function fetchArticles(): Promise<Entry[]> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=slug,updated_at&language=eq.en`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) return [];
    const rows = await r.json();
    return rows.map((a: any) => ({
      path: `/article/${a.slug}`,
      lastmod: new Date(a.updated_at).toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.8",
    }));
  } catch (e) {
    console.warn("Could not fetch articles for sitemap:", e);
    return [];
  }
}

function buildXml(entries: Entry[]) {
  const urls = entries.map((e) => [
    `  <url>`,
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean).join("\n")).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

(async () => {
  const articles = await fetchArticles();
  const all = [...staticEntries, ...articles];
  writeFileSync(resolve("public/sitemap.xml"), buildXml(all));
  console.log(`sitemap.xml written (${all.length} entries)`);
})();