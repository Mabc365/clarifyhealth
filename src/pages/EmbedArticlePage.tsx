import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Article = {
  slug: string; title: string; summary: string | null; tldr: string[];
  sections: { title: string; content: string }[];
};

const EmbedArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("articles").select("slug,title,summary,tldr,sections").eq("slug", slug).eq("language", "en").maybeSingle().then(({ data }) => {
      setArticle(data as unknown as Article | null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="p-6 text-center text-sm" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>Loading…</div>;
  if (!article) return <div className="p-6 text-center text-sm">Article not found.</div>;

  return (
    <div style={{ background: "#FAF8F3", color: "#1B2A24", fontFamily: "Inter,system-ui,sans-serif", padding: "20px", lineHeight: 1.7, fontSize: 16 }}>
      <article>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", color: "#1a6b4a", fontSize: 24, margin: "0 0 12px" }}>{article.title}</h1>
        {article.summary && <p style={{ marginBottom: 16 }}>{article.summary}</p>}
        {article.tldr?.length > 0 && (
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            {article.tldr.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}
        <div style={{ fontSize: 13, color: "#555", borderTop: "1px solid #D6E4DC", paddingTop: 12, marginTop: 16 }}>
          <a href={`https://clarifyhealth.co/article/${article.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a6b4a", fontWeight: 600 }}>
            Read the full explainer on Clarify Health →
          </a>
          <div style={{ marginTop: 6 }}>General health information — not medical advice. Talk to your doctor.</div>
        </div>
      </article>
    </div>
  );
};

export default EmbedArticlePage;