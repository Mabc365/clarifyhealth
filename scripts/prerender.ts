// Postbuild prerender: clones dist/index.html for each article + static route
// and injects per-page <title>, description, canonical, OG tags, and JSON-LD
// into <head>. Social crawlers (FB, LinkedIn, Slack, Twitter, iMessage) only
// read <head>, so this gives accurate previews without SSR. Googlebot continues
// to execute JS and pick up Helmet content as usual.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { topics } from "../src/data/topics";
import { holisticTopics } from "../src/data/holistic-topics";

const BASE_URL = "https://clarifyhealth.co";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://dojcuaoydegwqrzldtmp.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvamN1YW95ZGVnd3FyemxkdG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTkyMjYsImV4cCI6MjA5MDUzNTIyNn0.VE3uTke-6KF5QEQ5TkeNKioOew4FiPfUqHfRHHJLrAQ";

const DIST = resolve("dist");
const SHELL_PATH = resolve(DIST, "index.html");

type Page = {
  path: string;
  title: string;
  description: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  h1?: string;
  bodyHtml?: string;
  authored?: boolean;
};

const PRIVATE_PATHS = ["/dashboard", "/account", "/manage-plan", "/my-notes", "/checkout", "/checkout/return", "/search", "/login", "/signup"];

const STATIC_PAGES: Page[] = [
  { path: "/tools", title: "Health Tools — Clarify Health", description: "Plain-English health tools: jargon translator, symptom explainer, wellness plan, and more. Educational only." },
  { path: "/legal/privacy", title: "Privacy Policy — Clarify Health", description: "How Clarify Health handles your privacy." },
  { path: "/legal/terms", title: "Terms of Service — Clarify Health", description: "Terms of service for Clarify Health." },
  { path: "/legal/ai-disclaimer", title: "AI & Medical Disclaimer — Clarify Health", description: "Clarify Health is educational only. Always talk to your doctor." },
  { path: "/legal/cookies", title: "Cookie Policy — Clarify Health", description: "How Clarify Health uses cookies." },
  { path: "/legal/do-not-sell", title: "Do Not Sell My Info — Clarify Health", description: "Your privacy choices at Clarify Health." },
  { path: "/", title: "Clarify Health | AI Health & Wellness Companion", description: "Clarify Health helps you understand your health with AI-powered explanations, personalized wellness insights, and simple health tracking. Your health, in plain English." },
  { path: "/topics", title: "Health Topics — Clarify Health", description: "Browse plain-English explainers for the most common health conditions. Written at a Grade 6–8 reading level." },
  { path: "/translate", title: "Jargon Translator — Clarify Health", description: "Paste a confusing lab report, discharge note, or insurance letter and get a plain-English translation." },
  { path: "/glossary", title: "Medical Glossary — Clarify Health", description: "Plain-English definitions for thousands of medical terms." },
  { path: "/find-a-doctor", title: "Find a Doctor — Clarify Health", description: "Tools to help you find and prepare for a doctor's visit." },
  { path: "/wellness-plan", title: "Wellness Plan — Clarify Health", description: "Personalized, plain-English wellness guidance you can act on." },
  { path: "/about", title: "About Clarify Health", description: "Our mission: clear, trustworthy health information for everyone." },
  { path: "/author/mustafa-asif", title: "Mustafa Asif | Clarify Health Founder and Health Writer", description: "Meet Mustafa Asif, founder and health education writer at Clarify Health.", jsonLd: { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Person", name: "Mustafa Asif", url: "https://clarifyhealth.co/author/mustafa-asif" } } },
  { path: "/editorial-standards", title: "Editorial Standards — Clarify Health", description: "How we write, review, update, and correct every article. Conflict-of-interest policy." },
  { path: "/reviewers", title: "Our Reviewers — Clarify Health", description: "The clinicians and editors who review every article on Clarify Health." },
  { path: "/contact", title: "Contact — Clarify Health", description: "Get in touch with the Clarify Health team. We read every message." },
  { path: "/accessibility", title: "Accessibility Statement — Clarify Health", description: "Our WCAG 2.2 AA accessibility commitment and how to report barriers." },
];


const AUTHOR_URL = "https://clarifyhealth.co/author/mustafa-asif";
const AUTHOR = { "@type": "Person", "@id": AUTHOR_URL + "#person", name: "Mustafa Asif", url: AUTHOR_URL };
const PUBLISHER = { "@type": "Organization", "@id": BASE_URL + "/#organization", name: "Clarify Health", url: BASE_URL + "/" };

async function fetchArticles(): Promise<Page[]> {
  try {
    const fields = "slug,title,summary,last_reviewed,reviewer_name,sections,sources,updated_at";
    const r = await fetch(SUPABASE_URL + "/rest/v1/articles?select=" + fields + "&language=eq.en", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
    });
    if (!r.ok) { console.warn("[prerender] articles unavailable: " + r.status); return []; }
    const rows = (await r.json()) as any[];
    return rows.filter(a => a.slug && a.title).map(a => {
      const path = "/article/" + a.slug;
      const description = String(a.summary || a.title + ": a health explainer from Clarify Health.").slice(0, 300);
      return {
        path, title: a.title + " — Mustafa Asif | Clarify Health", description,
        authored: true, ogType: "article",
        bodyHtml: renderContent(a.title, description, a.sections, a.sources, a.reviewer_name),
        jsonLd: {
          "@context": "https://schema.org", "@type": ["Article", "MedicalWebPage"],
          "@id": BASE_URL + path + "#article", headline: a.title,
          description, url: BASE_URL + path, mainEntityOfPage: BASE_URL + path,
          inLanguage: "en", author: AUTHOR, publisher: PUBLISHER,
          ...(a.updated_at ? { dateModified: a.updated_at } : {}),
          ...(a.last_reviewed ? { lastReviewed: a.last_reviewed } : {}),
          ...(a.reviewer_name ? { reviewedBy: { "@type": "Person", name: a.reviewer_name } } : {}),
        },
      };
    });
  } catch (error) { console.warn("[prerender] article lookup failed:", error); return []; }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


function renderContent(title: string, description: string, sections: unknown, sources: unknown, reviewer?: unknown): string {
  const sectionHtml = (Array.isArray(sections) ? sections : []).map(section =>
    '<section><h2>' + esc(String(section?.title ?? "")) + '</h2><p>' +
    esc(String(section?.content ?? "")) + '</p></section>'
  ).join("");
  const references = (Array.isArray(sources) ? sources : []).map(source =>
    "<li>" + esc(String(source?.name ?? "")) + "</li>"
  ).join("");
  const reviewed = reviewer ? "<p>Reviewed by " + esc(String(reviewer)) + "</p>" : "";
  return '<main class="page-shell"><article class="mx-auto max-w-3xl">' +
    "<h1>" + esc(title) + "</h1><p>By <a href=" + '"'+ AUTHOR_URL + '"' + 
    ">Mustafa Asif</a>, founder and health education writer at Clarify Health.</p>" +
    "<p>" + esc(description) + "</p>" + sectionHtml +
    (references ? "<h2>Sources</h2><ul>" + references + "</ul>" : "") + reviewed +
    "<p>Educational only, not medical advice. Ask a qualified healthcare professional for personal guidance.</p></article></main>";
}

function builtInTopics(): Page[] {
  const make = (topic: { id: string; title: string; definition: string; sections: unknown; sources: unknown }, kind: string): Page => {
    const path = "/" + kind + "/" + topic.id;
    return {
      path, title: topic.title + " — Mustafa Asif | Clarify Health",
      description: topic.definition, authored: true, ogType: "article",
      bodyHtml: renderContent(topic.title, topic.definition, topic.sections, topic.sources),
      jsonLd: {
        "@context": "https://schema.org", "@type": ["Article", "MedicalWebPage"],
        "@id": BASE_URL + path + "#article", headline: topic.title,
        description: topic.definition, url: BASE_URL + path,
        mainEntityOfPage: BASE_URL + path, inLanguage: "en",
        author: AUTHOR, publisher: PUBLISHER,
      },
    };
  };
  return [...topics.map(topic => make(topic, "topics")), ...holisticTopics.map(topic => make(topic, "holistic"))];
}

function staticPagesWithAuthor(articles: Page[]): Page[] {
  return STATIC_PAGES.map(page => {
    if (page.path === "/") return {
      ...page,
      bodyHtml: '<main class="page-shell"><h1>Clarify Health — Health information in plain English</h1><p>Clarify Health helps patients and families understand confusing health information with approachable educational articles and AI-assisted explanations.</p><p>Founded by <a href="/author/mustafa-asif">Mustafa Asif</a>.</p><p><a href="/topics">Explore health topics</a> · <a href="/about">About Clarify Health</a></p><p>For education only; not medical advice.</p></main>',
    };
    return page.path !== "/author/mustafa-asif" ? page : {
    ...page, authored: true,
    bodyHtml: '<main class="page-shell"><h1>Mustafa Asif — Founder of Clarify Health</h1><p>Mustafa Asif founded Clarify Health to help patients and families understand medical information in plain language. He writes accessible health articles and develops educational tools for understanding complex medical information.</p><p>His academic interests include molecular biology, cancer research, and patient education.</p><p><a href="/topics">Health articles</a> | <a href="/about">About Clarify Health</a></p>' +
    '<section><h2>Health articles by Mustafa Asif</h2><ul>' +
    articles.map(article => '<li><a href="' + esc(article.path) + '">' + esc(article.title.replace(" — Mustafa Asif | Clarify Health", "")) + '</a></li>').join("") +
    '</ul></section></main>',
    jsonLd: {
      "@context": "https://schema.org", "@type": "ProfilePage",
      "@id": AUTHOR_URL + "#profile", url: AUTHOR_URL,
      mainEntity: { ...AUTHOR, description: "Founder and health education writer at Clarify Health.", worksFor: PUBLISHER },
    },
    };
  });
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

  if (page.authored) html = html.replace(/<meta name="author"[^>]*>/i, '<meta name="author" content="Mustafa Asif">');
  // Inject canonical + og:url + JSON-LD just before </head>
  const extras: string[] = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
  ];
  if (page.jsonLd) {
    extras.push(`<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>`);
  }
  if (page.noindex) html = html.replace(/<meta name="robots"[^>]*>\s*/i, "");
  if (page.noindex) extras.push(`<meta name="robots" content="noindex, nofollow">`);
  html = html.replace(/<link rel="canonical"[^>]*>\s*/i, "").replace(/<meta property="og:url"[^>]*>\s*/i, "");
  html = html.replace(/<\/head>/i, `  ${extras.join("\n  ")}\n</head>`);

  if (page.bodyHtml) html = html.replace('<div id="root"></div>', '<div id="root">' + page.bodyHtml + '</div>');
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

export async function prerender() {
  if (!existsSync(SHELL_PATH)) {
    console.warn("[prerender] dist/index.html not found — skipping");
    return;
  }
  const shell = readFileSync(SHELL_PATH, "utf-8");
  const articles = await fetchArticles();
  const privatePages: Page[] = PRIVATE_PATHS.map((path) => ({ path, title: "Clarify Health", description: "Clarify Health account area.", noindex: true }));
  const all = [...staticPagesWithAuthor(articles), ...builtInTopics(), ...articles, ...privatePages];
  for (const page of all) {
    const html = inject(shell, page);
    writeRoute(page.path, html);
  }
  console.log(`[prerender] wrote ${all.length} pages (${articles.length} articles)`);
}

if (process.argv[1]?.endsWith("prerender.ts")) prerender();