import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";
import mustafaPhoto from "@/assets/mustafa.jpeg";

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <main className="pt-32 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title={t("about.meta.title")}
        description={t("about.meta.desc")}
        canonical="/about"
        jsonLd={{
          "@type": "AboutPage",
          name: "About Clarify Health",
          description: t("about.meta.desc"),
        }}
      />
      <div className="mx-auto max-w-[680px]">
        <div className="stagger-reveal">
          <div className="w-[60px] h-[3px] bg-primary mb-6" />
          <h1
            className="text-[36px] md:text-[48px] font-medium leading-[1.1] text-foreground"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
          >
            {t("about.title")}
          </h1>

          {/* Author card */}
          <figure className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-xl"
            style={{
              border: "0.5px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--section-bg))",
            }}
          >
            <img
              src={mustafaPhoto}
              alt="Mustafa Asif, founder of Clarify Health"
              loading="lazy"
              className="w-[120px] h-[120px] rounded-full object-cover shrink-0 shadow-md"
              style={{ border: "2px solid hsl(var(--background))" }}
            />
            <figcaption className="text-center sm:text-left">
              <p
                className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Founder
              </p>
              <p
                className="text-[22px] font-medium text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Mustafa Asif
              </p>
              <p
                className="mt-1 text-[14px] text-muted-foreground"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Junior at Noor Ul Iman School, New Jersey
              </p>
            </figcaption>
          </figure>

          <div
            className="mt-10 space-y-6 text-[16px] leading-[1.8] text-foreground/80"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p>{t("about.p3")}</p>
          </div>
        </div>

        <div
          className="mt-16 p-8 animate-fade-in"
          style={{
            border: "0.5px solid hsl(var(--border))",
            borderRadius: "12px",
            backgroundColor: "hsl(var(--section-bg))",
            animationDelay: "300ms",
          }}
        >
          <p
            className="text-[14px] leading-relaxed text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <strong className="text-foreground">{t("about.title") === "Acerca de" ? "Importante:" : "Important:"}</strong> {t("about.disclaimer")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
