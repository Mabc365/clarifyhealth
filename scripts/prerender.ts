// Postbuild prerender: clones dist/index.html for each article + static route
// and injects per-page <title>, description, canonical, OG tags, and JSON-LD
// into <head>. Social crawlers (FB, LinkedIn, Slack, Twitter, iMessage) only
// read <head>, so this gives accurate previews without SSR. Googlebot continues
// to execute JS and pick up Helmet content as usual.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const BASE_URL = "https://clarifyhealth.co";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://dojcuaoydegwqrzldtmp.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvamN1YW95ZGVnd3FyemxkdG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTkyMjYsImV4cCI6MjA5MDUzNTIyNn0.VE3uTke-6KF5QEQ5TkeNKioOew4FiPfUqHfRHHJLrAQ";

const DIST = resolve("dist");
const SHELL_PATH = resolve(DIST, "index.html");

if (!existsSync(SHELL_PATH)) {
  console.warn("[prerender] dist/index.html not found — skipping");
  process.exit(0);
}

const shell = readFileSync(SHELL_PATH, "utf-8");

type Page = {
  path: string;
  title: string;
  description: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const STATIC_PAGES: Page[] = [
  { path: "/", title: "Clarify Health — Your health, in plain English", description: "Clear, trustworthy health education written in plain English. No jargon, no confusion — just answers you can actually understand." },
  { path: "/topics", title: "Health Topics — Clarify Health", description: "Browse plain-English explainers for the most common health conditions. Written at a Grade 6–8 reading level." },
  { path: "/ask", title: "Ask a Health Question — Clarify Health", description: "Get a plain-English answer to your health question, plus questions to ask your doctor. Not medical advice." },
  { path: "/translate", title: "Jargon Translator — Clarify Health", description: "Paste a confusing lab report, discharge note, or insurance letter and get a plain-English translation." },
  { path: "/symptoms", title: "Symptom Explainer — Clarify Health", description: "Describe what you're feeling and learn possible explanations and red flags. Not a diagnosis." },
  { path: "/glossary", title: "Medical Glossary — Clarify Health", description: "Plain-English definitions for thousands of medical terms." },
  { path: "/find-a-doctor", title: "Find a Doctor — Clarify Health", description: "Tools to help you find and prepare for a doctor's visit." },
  { path: "/wellness-plan", title: "Wellness Plan — Clarify Health", description: "Personalized, plain-English wellness guidance you can act on." },
  { path: "/about", title: "About Clarify Health", description: "Our mission: clear, trustworthy health information for everyone." },
  { path: "/editorial-standards", title: "Editorial Standards — Clarify Health", description: "How we write, review, update, and correct every article. Conflict-of-interest policy." },
  { path: "/reviewers", title: "Our Reviewers — Clarify Health", description: "The clinicians and editors who review every article on Clarify Health." },
  { path: "/contact", title: "Contact — Clarify Health", description: "Get in touch with the Clarify Health team. We read every message." },
  { path: "/accessibility", title: "Accessibility Statement — Clarify Health", description: "Our WCAG 2.2 AA accessibility commitment and how to report barriers." },
  { path: "/privacy", title: "Privacy Policy — Clarify Health", description: "How Clarify Health handles your privacy." },
  { path: "/terms", title: "Terms of Service — Clarify Health", description: "Terms of service for Clarify Health." },
  { path: "/disclaimer", title: "Medical Disclaimer — Clarify Health", description: "Clarify Health is educational only. Always talk to your doctor." },
];

async function fetchArticles(): Promise<Page[]> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=slug,title,summary,last_reviewed,reviewer_name&language=eq.en`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) {
      console.warn(`[prerender] articles fetch failed (${r.status})`);
      return [];
    }
    const rows = await r.json();
    return rows.map((a: any) => {
      const title = `${a.title} — Clarify Health`;
      const description = (a.summary || `${a.title}: a plain-English explainer from Clarify Health.`).slice(0, 300);
      return {
        path: `/article/${a.slug}`,
        title,
        description,
        ogType: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: a.title,
          headline: a.title,
          description,
          url: `${BASE_URL}/article/${a.slug}`,
          inLanguage: "en",
          datePublished: a.last_reviewed,
          dateModified: a.last_reviewed,
          author: { "@type": "Person", name: a.reviewer_name || "Clarify Health Editorial" },
          publisher: { "@type": "Organization", name: "Clarify Health", url: BASE_URL },
        },
      };
    });
  } catch (e) {
    console.warn("[prerender] articles fetch error:", e);
    return [];
  }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inject(shellHtml: string, page: Page): string {
  const url = `${BASE_URL}${page.path}`;
  const ogType = page.ogType || "website";
  let html = shellHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  // Replace meta description
  html = html.replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(page.description)}">`);
  // Replace og:type, og:title, og:description, twitter:title, twitter:description
  html = html.replace(/<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="${ogType}">`);
  html = html.replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(page.title)}">`);
  html = html.replace(/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(page.title)}">`);
  html = html.replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(page.description)}">`);
  html = html.replace(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(page.description)}">`);

  // Inject canonical + og:url + JSON-LD just before </head>
  const extras: string[] = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
  ];
  if (page.jsonLd) {
    extras.push(`<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>`);
  }
  html = html.replace(/<\/head>/i, `  ${extras.join("\n  ")}\n</head>`);

  return html;
}

function writeRoute(routePath: string, html: string) {
  // "/" → dist/index.html (skip — already exists)
  // "/topics" → dist/topics/index.html
  if (routePath === "/") {
    writeFileSync(SHELL_PATH, html);
    return;
  }
  const dir = resolve(DIST, routePath.replace(/^\//, ""));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html);
}

(async () => {
  const articles = await fetchArticles();
  const all = [...STATIC_PAGES, ...articles];
  for (const page of all) {
    const html = inject(shell, page);
    writeRoute(page.path, html);
  }
  console.log(`[prerender] wrote ${all.length} pages (${articles.length} articles)`);
})();