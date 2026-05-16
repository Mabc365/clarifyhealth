import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Leaf, ShieldCheck, Stethoscope, Sparkles } from "lucide-react";
import { getTopics } from "@/data/topics";
import { getHolisticTopics } from "@/data/holistic-topics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReveal } from "@/hooks/use-reveal";
import PageMeta from "@/components/PageMeta";
import HeroIllustration from "@/components/HeroIllustration";

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

      {/* Hero — full viewport, two-column on desktop */}
      <section className="relative flex min-h-[100vh] items-center overflow-hidden px-6 pt-28 pb-20 md:pt-32">
        {/* Organic blob backdrops */}
        <div className="blob" style={{ background: "hsl(var(--secondary))", width: 520, height: 520, top: -120, left: -120 }} />
        <div className="blob" style={{ background: "hsl(var(--accent) / 0.28)", width: 380, height: 380, bottom: -100, right: -80, animationDelay: "-9s" }} />

        <div
          ref={heroReveal.ref}
          className={`relative z-10 mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-12 md:grid-cols-[1.05fr,0.95fr] md:gap-16 ${heroReveal.visible ? "stagger-reveal" : ""}`}
          style={{ opacity: heroReveal.visible ? undefined : 0 }}
        >
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-[12px] font-medium text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Plain-English health, for real humans
            </span>

            <h1
              className="mt-6 text-[44px] font-semibold text-foreground md:text-[72px]"
              style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.025em", lineHeight: 1.05 }}
            >
              Your health.{" "}
              <span className="hand-underline text-primary">Finally,</span>
              <br />
              in plain English.
            </h1>

            <p
              className="mt-7 max-w-[560px] text-[18px] text-foreground/80 md:text-[19px]"
              style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.65 }}
            >
              Skip the jargon. Get clear, doctor-reviewed answers to the
              questions you'd actually ask — in language a real human uses.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/ask")}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-card transition-all hover:bg-primary/90 hover:shadow-lg press-scale"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Ask a health question
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                to="/topics"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-6 py-3.5 text-[15px] font-semibold text-foreground backdrop-blur transition-all hover:bg-background hover:border-foreground/30 press-scale"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Browse topics
              </Link>
            </div>

            {/* Inline secondary search */}
            <form onSubmit={handleSearch} className="mt-7 max-w-[520px]" role="search" aria-label="Search health topics">
              <label htmlFor="hero-search" className="sr-only">Search a condition or ask a question</label>
              <div
                className="flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-2 transition-all focus-within:border-primary"
                style={{ border: "1px solid hsl(var(--border))", borderRadius: "999px", boxShadow: "var(--shadow-soft)" }}
              >
                <Search className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  id="hero-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “What does high LDL mean?”"
                  className="h-10 w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background hover:opacity-90 transition-all press-scale"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Trust strip */}
            <ul
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
              aria-label="Trust indicators"
            >
              <li className="flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Reviewed by clinicians</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Plain-English certified</li>
              <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> No ads, no data selling</li>
            </ul>
          </div>

          {/* Illustration column */}
          <div className="flex items-center justify-center md:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative grain-bg px-6 py-[80px] md:py-[120px] overflow-hidden" style={{ backgroundColor: "hsl(var(--section-bg))" }}>
        <div className="blob" style={{ background: "hsl(var(--accent) / 0.18)", width: 340, height: 340, top: -60, right: -80 }} />
        <div
          ref={statsReveal.ref}
          className="mx-auto max-w-[1100px]"
          style={{ opacity: statsReveal.visible ? undefined : 0 }}
        >
          <div className={`relative grid grid-cols-1 md:grid-cols-3 gap-6 ${statsReveal.visible ? "stagger-reveal" : ""}`}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className="card-soft flex flex-col items-center px-6 py-10 text-center"
              >
                <span
                  className={`${stat.size} font-semibold text-primary`}
                  style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.03em" }}
                >
                  {stat.value}
                </span>
                <span
                  className="mt-3 max-w-[260px] text-[15px] leading-relaxed text-foreground/80"
                  style={{ fontFamily: "Inter, sans-serif" }}
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
      <section className="relative px-6 py-[80px] md:py-[120px] overflow-hidden">
        <div className="blob" style={{ background: "hsl(var(--secondary))", width: 420, height: 420, top: 40, left: -160 }} />
        <div
          ref={topicsReveal.ref}
          className="relative mx-auto max-w-[1180px]"
          style={{ opacity: topicsReveal.visible ? undefined : 0 }}
        >
          <h2
            className={`mb-3 text-[34px] font-semibold text-foreground md:text-[44px] ${topicsReveal.visible ? "animate-fade-in" : ""}`}
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {t("home.explore")}
          </h2>
          <p className="mb-12 max-w-[560px] text-[17px] text-muted-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            Common conditions, decoded. Each one written like a friend who happens to have a medical degree.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-5 ${topicsReveal.visible ? "stagger-reveal" : ""}`}>
            {topics.map((topic) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="card-soft group flex flex-col p-7"
              >
                <div>
                  <h3
                    className="text-[22px] font-semibold text-foreground"
                    style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.015em" }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="mt-2 text-[15px] leading-relaxed text-muted-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {topic.description}
                  </p>
                </div>
                <div
                  className="mt-auto pt-6 flex items-center text-primary"
                  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", fontSize: "13px", fontWeight: 600 }}
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
      <section className="relative grain-bg px-6 py-[80px] md:py-[120px] overflow-hidden" style={{ backgroundColor: "hsl(var(--section-bg))" }}>
        <div className="blob" style={{ background: "hsl(var(--accent) / 0.22)", width: 360, height: 360, bottom: -80, right: -100 }} />
        <div
          ref={holisticReveal.ref}
          className="relative mx-auto max-w-[1180px]"
          style={{ opacity: holisticReveal.visible ? undefined : 0 }}
        >
          <div className={`flex items-center gap-3 mb-4 ${holisticReveal.visible ? "animate-fade-in" : ""}`}>
            <Leaf className="h-5 w-5 text-primary" />
            <span
              className="font-semibold uppercase text-primary"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.14em", fontSize: "11px" }}
            >
              {t("home.holistic.label")}
            </span>
          </div>
          <h2
            className={`mb-4 text-[34px] font-semibold text-foreground md:text-[44px] ${holisticReveal.visible ? "animate-fade-in" : ""}`}
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {t("home.holistic.title")}
          </h2>
          <p
            className={`mb-12 max-w-[600px] text-[17px] leading-relaxed text-muted-foreground ${holisticReveal.visible ? "animate-fade-in" : ""}`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {t("home.holistic.sub")}
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-5 ${holisticReveal.visible ? "stagger-reveal" : ""}`}>
            {holisticTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/holistic/${topic.id}`}
                className="card-soft group flex flex-col p-7"
              >
                <div>
                  <h3
                    className="text-[22px] font-semibold text-foreground"
                    style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.015em" }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="mt-2 text-[15px] leading-relaxed text-muted-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {topic.description}
                  </p>
                </div>
                <div
                  className="mt-auto pt-6 flex items-center text-primary"
                  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", fontSize: "13px", fontWeight: 600 }}
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
