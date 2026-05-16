import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Check, Copy } from "lucide-react";
import { getTopics } from "@/data/topics";
import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";
import { trackTopicView } from "@/lib/analytics";

const TopicPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const topics = getTopics(lang);
  const topic = topics.find((tp) => tp.id === id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (topic) trackTopicView(topic.id, topic.title);
  }, [topic]);

  const handleCopy = () => {
    if (!topic) return;
    const text = topic.doctorQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!topic) {
    return (
      <main className="pt-32 px-6 text-center">
        <PageMeta title={`${t("topic.notFound")} | Clarify Health`} description={t("topic.notFound")} canonical="/topics" />
        <h1 className="text-[28px] font-semibold text-foreground">{t("topic.notFound")}</h1>
        <Link to="/topics" className="mt-4 inline-block text-primary hover:underline text-[15px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {t("topic.backLink")}
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-0 px-6">
      <PageMeta
        title={`${topic.title} ${lang === "es" ? "Explicado" : "Explained Simply"} | Clarify Health`}
        description={lang === "es"
          ? `Aprende qué significa ${topic.title.toLowerCase()} en español sencillo. Sin jerga médica. Incluye preguntas para tu doctor.`
          : `Learn what ${topic.title.toLowerCase()} means in plain English. No medical jargon. Includes questions to ask your doctor.`}
        canonical={`/topics/${topic.id}`}
        jsonLd={{
          "@graph": [
            {
              "@type": "MedicalWebPage",
              "@id": `https://clarifyhealth.co/topics/${topic.id}#webpage`,
              url: `https://clarifyhealth.co/topics/${topic.id}`,
              name: topic.title,
              about: { "@type": "MedicalCondition", name: topic.title },
              description: topic.definition,
              audience: { "@type": "PeopleAudience", audienceType: "Patient" },
              lastReviewed: "2026-03-01",
              mainContentOfPage: { "@type": "WebPageElement", cssSelector: ".stagger-reveal" },
              author: {
                "@type": "Person",
                name: "Mustafa Asif",
                url: "https://clarifyhealth.co/about",
                description:
                  "Founder of Clarify Health. Researches and writes plain-English health explainers using only peer-reviewed sources (PubMed, NIH, Mayo Clinic, Harvard Health).",
              },
              publisher: {
                "@type": "Organization",
                name: "Clarify Health",
                url: "https://clarifyhealth.co",
              },
              citation: topic.sources.map((s) => ({
                "@type": "CreativeWork",
                name: s.name,
                url: s.url,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://clarifyhealth.co/" },
                { "@type": "ListItem", position: 2, name: "Topics", item: "https://clarifyhealth.co/topics" },
                { "@type": "ListItem", position: 3, name: topic.title, item: `https://clarifyhealth.co/topics/${topic.id}` },
              ],
            },
          ],
        }}
      />
      <div className="mx-auto max-w-[1100px]">
        {/* Breadcrumb */}
        <nav
          className="mb-10 flex items-center gap-2 font-medium uppercase text-primary animate-fade-in"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.2px", fontSize: "11px" }}
        >
          <Link to="/topics" className="hover:underline">{t("topic.backToTopics")}</Link>
          <span className="text-muted-foreground">→</span>
          <span>{topic.title}</span>
        </nav>

        {/* Hero */}
        <div className="stagger-reveal">
          <h1 className="text-[44px] font-semibold leading-[1.1] text-foreground md:text-[56px]" style={{ letterSpacing: "-1px" }}>
            {topic.title}
          </h1>
          <p className="mt-5 max-w-[680px] text-[18px] leading-relaxed text-muted-foreground md:text-[20px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {topic.definition}
          </p>
        </div>

        {/* Green rule */}
        <div className="mt-10 mb-16 h-px w-full bg-primary/30 animate-fade-in" style={{ animationDelay: "200ms" }} />

        {/* Two-column layout */}
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          {/* Main content — 65% */}
          <div className="w-full lg:w-[65%]">
            <div className="space-y-14 stagger-reveal">
              {topic.sections.map((section, i) => (
                <section key={i}>
                  <span className="mb-3 block font-semibold uppercase text-primary" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.2px", fontSize: "11px" }}>
                    {section.label}
                  </span>
                  <h2 className="mb-5 text-[26px] font-medium leading-tight text-foreground md:text-[28px]" style={{ letterSpacing: "-0.5px" }}>
                    {section.title}
                  </h2>
                  <p className="text-[16px] text-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: "1.75" }}>
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            {/* Sources */}
            <div className="mt-20 animate-fade-in" style={{ animationDelay: "350ms" }}>
              <div className="h-px w-full bg-border mb-8" style={{ height: "0.5px" }} />
              <p className="text-[13px] text-muted-foreground mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t("topic.sourcesDisclaimer")}
              </p>
              <h3 className="text-[13px] font-semibold uppercase text-muted-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1px" }}>
                {t("topic.sourcesTitle")}
              </h3>
              <ul className="space-y-1.5">
                {topic.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-muted-foreground hover:text-primary transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {source.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div
              className="mt-12 p-8 animate-fade-in grain-bg"
              style={{ border: "0.5px solid hsl(var(--border))", borderRadius: "12px", backgroundColor: "hsl(var(--section-bg))", animationDelay: "400ms" }}
            >
              <p className="relative text-[14px] leading-relaxed text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <strong className="text-foreground">{lang === "es" ? "Aviso:" : "Disclaimer:"}</strong> {t("topic.disclaimer")}
              </p>
            </div>
          </div>

          {/* Sidebar — 35% */}
          <aside className="w-full lg:w-[35%]">
            <div className="lg:sticky lg:top-28 p-8 animate-fade-in" style={{ backgroundColor: "#e8f5ef", borderRadius: "12px", animationDelay: "300ms" }}>
              <h3 className="text-[20px] font-semibold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t("topic.doctorQuestions")}
              </h3>
              <ol className="mt-6 space-y-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {topic.doctorQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-primary" style={{ backgroundColor: "#d0ebdd" }}>
                      {i + 1}
                    </span>
                    {q}
                  </li>
                ))}
              </ol>
              <button
                onClick={handleCopy}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 py-3 text-[14px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all press-scale"
                style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "4px" }}
              >
                {copied ? (<><Check className="h-4 w-4" />{t("topic.copied")}</>) : (<><Copy className="h-4 w-4" />{t("topic.copy")}</>)}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="grain-bg mt-24 px-6 py-[64px] md:py-[80px]" style={{ backgroundColor: "hsl(var(--section-bg))" }}>
        <div className="relative mx-auto max-w-[1100px] flex flex-col items-center text-center">
          <h2 className="text-[32px] font-semibold text-foreground md:text-[36px]" style={{ letterSpacing: "-0.5px" }}>
            {t("topic.stillHaveQuestions")}
          </h2>
          <p className="mt-3 max-w-[480px] text-[16px] text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {t("topic.cta.sub")}
          </p>
          <Link
            to="/ask"
            className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-3 text-[14px] font-medium text-primary-foreground hover:bg-primary/90 transition-all press-scale"
            style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "4px" }}
          >
            {t("topic.cta.button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default TopicPage;
