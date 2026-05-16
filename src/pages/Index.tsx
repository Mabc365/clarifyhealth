import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Leaf } from "lucide-react";
import { getTopics } from "@/data/topics";
import { getHolisticTopics } from "@/data/holistic-topics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReveal } from "@/hooks/use-reveal";
import PageMeta from "@/components/PageMeta";

const Index = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const topics = getTopics(lang);
  const holisticTopics = getHolisticTopics(lang);

  const stats = [
    { value: t("home.stat1.value"), label: t("home.stat1.label"), size: "text-[52px] md:text-[60px]" },
    { value: t("home.stat2.value"), label: t("home.stat2.label"), size: "text-[52px] md:text-[60px]" },
    { value: t("home.stat3.value"), label: t("home.stat3.label"), size: "text-[52px] md:text-[60px]" },
  ];

  const heroReveal = useReveal(0.1);
  const statsReveal = useReveal(0.15);
  const topicsReveal = useReveal(0.1);
  const holisticReveal = useReveal(0.1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ask?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main>
      <PageMeta
        title={t("home.meta.title")}
        description={t("home.meta.desc")}
        canonical="/"
        jsonLd={{
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://clarifyhealth.co/#website",
              name: "Clarify Health",
              url: "https://clarifyhealth.co",
              description: t("home.meta.desc"),
              potentialAction: {
                "@type": "SearchAction",
                target: "https://clarifyhealth.co/ask?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "MedicalOrganization",
              "@id": "https://clarifyhealth.co/#organization",
              name: "Clarify Health",
              url: "https://clarifyhealth.co",
              description:
                "Clarify Health is a plain-English health education resource that translates complex medical information into clear, trustworthy answers anyone can understand.",
              areaServed: "Worldwide",
              knowsLanguage: ["en", "es", "ur", "hi", "ar"],
              medicalSpecialty: [
                "PrimaryCare",
                "Cardiovascular",
                "Endocrine",
                "Psychiatric",
                "Pulmonary",
              ],
            },
            {
              "@type": "WebPage",
              "@id": "https://clarifyhealth.co/#webpage",
              url: "https://clarifyhealth.co/",
              name: t("home.meta.title"),
              description: t("home.meta.desc"),
              isPartOf: { "@id": "https://clarifyhealth.co/#website" },
              about: { "@id": "https://clarifyhealth.co/#organization" },
            },
          ],
        }}
      />

      {/* Hero — full viewport */}
      <section className="flex min-h-screen flex-col justify-center px-6">
        <div
          ref={heroReveal.ref}
          className={`mx-auto w-full max-w-[1100px] pr-8 md:pr-[200px] ${heroReveal.visible ? "stagger-reveal" : ""}`}
          style={{ opacity: heroReveal.visible ? undefined : 0 }}
        >
          {/* Editorial rule */}
          <div className="w-[60px] h-[1px] bg-primary mb-8" />

          <h1
            className="text-[44px] leading-[1.1] font-semibold text-foreground md:text-[72px]"
            style={{ letterSpacing: "-1px" }}
          >
            {t("home.hero.line1")}
            <br />
            {t("home.hero.line2")}
            <br />
            {t("home.hero.line3")}
          </h1>
          <p
            className="mt-6 max-w-[560px] text-[16px] leading-relaxed text-muted-foreground md:text-[18px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t("home.hero.sub")}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-[560px]">
            <div className="flex gap-0" style={{ border: "0.5px solid hsl(var(--border))", borderRadius: "4px" }}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("home.search.placeholder")}
                  className="h-12 w-full bg-transparent pl-11 pr-4 text-[15px] placeholder:text-muted-foreground focus:outline-none focus-glow transition-shadow"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 text-[14px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all press-scale"
                style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "0 3px 3px 0" }}
              >
                {t("home.search.button")}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grain-bg px-6 py-[80px] md:py-[144px]" style={{ backgroundColor: "hsl(var(--section-bg))" }}>
        <div
          ref={statsReveal.ref}
          className="mx-auto max-w-[1100px]"
          style={{ opacity: statsReveal.visible ? undefined : 0 }}
        >
          <div className={`grid grid-cols-1 md:grid-cols-3 ${statsReveal.visible ? "stagger-reveal" : ""}`}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center py-10 md:py-0 ${
                  i < stats.length - 1 ? "md:border-r" : ""
                }`}
                style={{
                  borderColor: "hsl(var(--border))",
                  borderWidth: i < stats.length - 1 ? "0 0.5px 0 0" : "0",
                }}
              >
                <span
                  className={`${stat.size} font-semibold text-primary`}
                  style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-1px" }}
                >
                  {stat.value}
                </span>
                <span
                  className="mt-3 max-w-[240px] text-center text-[14px] leading-snug text-foreground"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <p
            className="mt-10 text-center text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.3px" }}
          >
            {t("home.stat.source")}
          </p>
        </div>
      </section>

      {/* Topics grid */}
      <section className="px-6 py-[80px] md:py-[144px]">
        <div
          ref={topicsReveal.ref}
          className="mx-auto max-w-[1100px]"
          style={{ opacity: topicsReveal.visible ? undefined : 0 }}
        >
          <h2
            className={`mb-14 text-[32px] font-semibold text-foreground md:text-[40px] ${topicsReveal.visible ? "animate-fade-in" : ""}`}
          >
            {t("home.explore")}
          </h2>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start ${topicsReveal.visible ? "stagger-reveal" : ""}`} style={{ gap: "16px" }}>
            {topics.map((topic) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="group flex flex-col p-8 transition-all hover:border-primary/60"
                style={{
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <h3
                    className="text-[22px] font-medium text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="mt-2 text-[14px] leading-relaxed text-muted-foreground"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {topic.description}
                  </p>
                </div>
                <div
                  className="mt-6 flex items-center text-muted-foreground group-hover:text-primary transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.2px", fontSize: "11px", textTransform: "uppercase" }}
                >
                  <span className="mr-2">{t("home.readMore")}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Holistic & Natural Health section */}
      <section className="grain-bg px-6 py-[80px] md:py-[144px]" style={{ backgroundColor: "hsl(var(--section-bg))" }}>
        <div
          ref={holisticReveal.ref}
          className="mx-auto max-w-[1100px]"
          style={{ opacity: holisticReveal.visible ? undefined : 0 }}
        >
          <div className={`flex items-center gap-3 mb-4 ${holisticReveal.visible ? "animate-fade-in" : ""}`}>
            <Leaf className="h-5 w-5 text-primary" />
            <span
              className="font-semibold uppercase text-primary"
              style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.2px", fontSize: "11px" }}
            >
              {t("home.holistic.label")}
            </span>
          </div>
          <h2
            className={`mb-4 text-[32px] font-semibold text-foreground md:text-[40px] ${holisticReveal.visible ? "animate-fade-in" : ""}`}
          >
            {t("home.holistic.title")}
          </h2>
          <p
            className={`mb-14 max-w-[600px] text-[16px] leading-relaxed text-muted-foreground ${holisticReveal.visible ? "animate-fade-in" : ""}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t("home.holistic.sub")}
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start ${holisticReveal.visible ? "stagger-reveal" : ""}`} style={{ gap: "16px" }}>
            {holisticTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/holistic/${topic.id}`}
                className="group flex flex-col p-8 transition-all hover:border-primary/60"
                style={{
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: "12px",
                  backgroundColor: "hsl(var(--background))",
                }}
              >
                <div>
                  <h3
                    className="text-[22px] font-medium text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="mt-2 text-[14px] leading-relaxed text-muted-foreground"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {topic.description}
                  </p>
                </div>
                <div
                  className="mt-6 flex items-center text-muted-foreground group-hover:text-primary transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.2px", fontSize: "11px", textTransform: "uppercase" }}
                >
                  <span className="mr-2">{t("home.readMore")}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
