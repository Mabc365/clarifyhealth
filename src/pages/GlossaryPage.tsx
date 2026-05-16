import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageMeta from "@/components/PageMeta";

type Term = {
  id: string;
  term: string;
  pronunciation: string | null;
  plain_definition: string;
  category: string | null;
};

const GlossaryPage = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("glossary_terms").select("id, term, pronunciation, plain_definition, category").eq("language", "en").order("term").then(({ data }) => {
      if (data) setTerms(data as Term[]);
    });
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return terms;
    return terms.filter((t) => t.term.toLowerCase().includes(needle) || t.plain_definition.toLowerCase().includes(needle));
  }, [terms, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Term[]>();
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-background">
      <PageMeta title="Medical Glossary — Clarify Health" description="Common medical terms explained in plain English with pronunciation." canonical="/glossary" />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
            Plain-English Glossary
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Medical words, said simply. Click a term for the definition and how to pronounce it.
          </p>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search glossary"
            className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-card text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {grouped.length === 0 && <p className="text-muted-foreground">No terms match.</p>}

        {grouped.map(([letter, items]) => (
          <section key={letter} className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3" style={{ fontFamily: "Fraunces, serif" }}>{letter}</h2>
            <dl className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                  <dt className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-semibold text-[17px]">{t.term}</span>
                    {t.pronunciation && <span className="text-sm text-muted-foreground italic">/{t.pronunciation}/</span>}
                  </dt>
                  <dd className="text-[16px] text-muted-foreground mt-1 leading-[1.6]">{t.plain_definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
};

export default GlossaryPage;