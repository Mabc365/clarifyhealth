import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageMeta from "@/components/PageMeta";

type Hit = { slug: string; title: string; summary: string | null };

const SearchResultsPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setQuery(q); }, [q]);

  useEffect(() => {
    if (!q.trim()) { setHits([]); return; }
    setLoading(true);
    supabase.from("articles").select("slug,title,summary").eq("language", "en").or(`title.ilike.%${q}%,summary.ilike.%${q}%`).limit(30)
      .then(({ data }) => { setHits((data as Hit[]) ?? []); setLoading(false); });
  }, [q]);

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 bg-background">
      <PageMeta title={q ? `Search: ${q} — Clarify Health` : "Search — Clarify Health"} description="Search plain-English health explainers." canonical="/search" />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6" style={{ fontFamily: "Fraunces, serif" }}>Search</h1>
        <form onSubmit={(e) => { e.preventDefault(); setParams({ q: query }); }} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles, conditions, terms…"
            className="w-full rounded-full border border-input bg-card pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Search" />
        </form>

        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>}
        {!loading && q && hits.length === 0 && (
          <p className="text-muted-foreground">No articles match "{q}". Try the <Link to="/ask" className="text-primary underline">Ask</Link> tool, or <Link to="/topics" className="text-primary underline">browse all topics</Link>.</p>
        )}
        <ul className="space-y-4">
          {hits.map((h) => (
            <li key={h.slug}>
              <Link to={`/article/${h.slug}`} className="block rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                <h2 className="font-semibold text-lg mb-1">{h.title}</h2>
                {h.summary && <p className="text-sm text-muted-foreground line-clamp-2">{h.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default SearchResultsPage;