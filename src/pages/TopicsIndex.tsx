import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getTopics } from "@/data/topics";
import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";

const TopicsIndex = () => {
  const { lang, t } = useLanguage();
  const topics = getTopics(lang);
  return (
    <main className="page-shell">
      <PageMeta title={t("topics.meta.title")} description={t("topics.meta.desc")} canonical="/topics" jsonLd={{ "@type": "CollectionPage", name: t("topics.title"), description: t("topics.meta.desc"), mainEntity: { "@type": "ItemList", numberOfItems: topics.length, itemListElement: topics.map((topic, index) => ({ "@type": "ListItem", position: index + 1, name: topic.title, url: `https://clarifyhealth.lovable.app/topics/${topic.id}` })) } }} />
      <header className="page-intro">
        <p className="micro-label text-accent">Plain-English library</p>
        <h1>{t("topics.title")}</h1>
        <p>{t("topics.sub")}</p>
      </header>
      <ul className="directory-grid" aria-label={t("topics.title")}>
        {topics.map((topic, index) => (
          <li key={topic.id}>
            <Link to={`/topics/${topic.id}`} className="group flex min-h-[250px] flex-col justify-between p-6 md:p-7">
              <div className="flex items-start justify-between gap-4"><span className="micro-label text-accent">Topic {String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" /></div>
              <div><h2 className="text-[24px] font-medium leading-tight text-foreground">{topic.title}</h2><p className="mt-3 line-clamp-3 text-[14px] leading-[1.6] text-muted-foreground">{topic.description}</p></div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default TopicsIndex;