import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { getTopics } from "@/data/topics";
import { CATEGORIES, getCategory, categoryLabel, type CategoryId } from "@/data/topic-categories";
import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";

const TopicsIndex = () => {
  const { lang, t } = useLanguage();
  const topics = getTopics(lang);
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return topics.filter((tp) =>
      (active === "all" || getCategory(tp.id)?.id === active) &&
      (!s || tp.title.toLowerCase().includes(s) || tp.description.toLowerCase().includes(s))
    );
  }, [topics, active, q]);

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary"}`;

  return (
    <main className="page-shell">
      <PageMeta title={t("topics.meta.title")} description={t("topics.meta.desc")} canonical="/topics" jsonLd={{ "@type": "CollectionPage", name: t("topics.title"), description: t("topics.meta.desc"), mainEntity: { "@type": "ItemList", numberOfItems: topics.length, itemListElement: topics.map((topic, index) => ({ "@type": "ListItem", position: index + 1, name: topic.title, url: `https://clarifyhealth.lovable.app/topics/${topic.id}` })) } }} />
      <header className="page-intro">
        <p className="micro-label text-accent">Plain-English library</p>
        <h1>{t("topics.title")}</h1>
        <p>{t("topics.sub")}</p>
      </header>

      <div className="mb-8 space-y-4">
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "es" ? "Buscar un tema…" : "Search a topic…"}
            aria-label={lang === "es" ? "Buscar un tema" : "Search a topic"}
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === "es" ? "Categorías" : "Categories"}>
          <button className={chip(active === "all")} aria-pressed={active === "all"} onClick={() => setActive("all")}>
            {lang === "es" ? "Todos" : "All"} <span className="opacity-70">{topics.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const count = topics.filter((tp) => getCategory(tp.id)?.id === c.id).length;
            if (!count) return null;
            return (
              <button key={c.id} className={chip(active === c.id)} aria-pressed={active === c.id} onClick={() => setActive(c.id)}>
                <c.icon className="h-4 w-4" /> {categoryLabel(c, lang)} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{lang === "es" ? "No encontramos temas. Prueba otra palabra." : "No topics found. Try another word."}</p>
      ) : (
        <ul className="directory-grid" aria-label={t("topics.title")}>
          {filtered.map((topic) => {
            const cat = getCategory(topic.id);
            return (
              <li key={topic.id}>
                <Link to={`/topics/${topic.id}`} className="group flex min-h-[230px] flex-col justify-between p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="micro-label inline-flex items-center gap-1.5 text-accent">{cat && <cat.icon className="h-3.5 w-3.5" />}{cat ? categoryLabel(cat, lang) : "Topic"}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
                  </div>
                  <div><h2 className="text-[24px] font-medium leading-tight text-foreground">{topic.title}</h2><p className="mt-3 line-clamp-3 text-[14px] leading-[1.6] text-muted-foreground">{topic.description}</p></div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default TopicsIndex;
