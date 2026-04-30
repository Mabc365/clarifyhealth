import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getTopics } from "@/data/topics";
import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";

const TopicsIndex = () => {
  const { lang, t } = useLanguage();
  const topics = getTopics(lang);

  return (
    <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title={t("topics.meta.title")}
        description={t("topics.meta.desc")}
        canonical="/topics"
        jsonLd={{
          "@type": "CollectionPage",
          name: t("topics.title"),
          description: t("topics.meta.desc"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: topics.length,
            itemListElement: topics.map((topic, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: topic.title,
              url: `https://clarifyhealth.lovable.app/topics/${topic.id}`,
            })),
          },
        }}
      />
      <div className="mx-auto max-w-[760px]">
        <div className="stagger-reveal">
          <div className="w-[60px] h-[3px] bg-primary mb-6" />
          <h1
            className="text-[36px] md:text-[48px] font-medium leading-[1.1] text-foreground"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
          >
            {t("topics.title")}
          </h1>
          <p
            className="mt-4 text-[16px] leading-relaxed text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t("topics.sub")}
          </p>
        </div>

        <ul className="mt-12 stagger-reveal" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
          {topics.map((topic, i) => (
            <li key={topic.id} style={{ borderBottom: "0.5px solid hsl(var(--border))" }}>
              <Link
                to={`/topics/${topic.id}`}
                className="group flex items-center gap-6 py-6 transition-colors hover:bg-[hsl(var(--section-bg))] -mx-4 px-4 rounded-md"
              >
                <span
                  className="text-[12px] tabular-nums text-muted-foreground w-6 shrink-0"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-[20px] md:text-[22px] font-medium text-foreground group-hover:text-primary transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {topic.title}
                  </h2>
                  <p
                    className="mt-1 text-[14px] leading-relaxed text-muted-foreground line-clamp-2"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {topic.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default TopicsIndex;
