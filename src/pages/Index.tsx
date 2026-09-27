import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Heart, Activity } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/clarify-hero-consultation.jpg";

const Index = () => {
  const { t } = useLanguage();
  const cards = [
    { h: t("home.card1.h"), p: t("home.card1.p") },
    { h: t("home.card2.h"), p: t("home.card2.p") },
    { h: t("home.card3.h"), p: t("home.card3.p") },
  ];
  const steps = [t("home.step1"), t("home.step2"), t("home.step3")];

  return (
    <main className="bg-background">
      <PageMeta title={`Clarify Health — ${t("home.hero")}`} description={t("home.sub")} canonical="/" />

      <section className="home-hero relative min-h-[720px] overflow-hidden md:min-h-[820px]" aria-labelledby="home-title">
        <img
          src={heroImage}
          alt="A patient and clinician calmly reviewing a health report together"
          width={1920}
          height={1280}
          fetchPriority="high"
          className="home-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1180px] items-end px-6 pb-16 pt-32 md:min-h-[820px] md:items-center md:pb-24 md:pt-36">
          <div className="max-w-[720px] text-primary-foreground">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/75">
              Clear health information. No jargon.
            </p>
            <h1 id="home-title" className="max-w-[700px] text-[48px] font-semibold leading-[0.98] md:text-[76px]">
              {t("home.hero")}
            </h1>
            <p className="mt-6 max-w-[570px] text-[17px] leading-[1.7] text-primary-foreground/85 md:text-[19px]">
              {t("home.sub")}
            </p>
            <Link to="/ask" className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-foreground transition-transform hover:scale-[1.02] press-scale">
              {t("home.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-6 py-20 md:py-28" aria-label="Why Clarify Health">
        <div className="mx-auto grid max-w-[1080px] grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {cards.map((card, index) => (
            <article key={card.h} className="py-8 md:px-10 md:py-2 first:pl-0 last:pr-0">
              <span className="text-[12px] font-semibold text-primary">0{index + 1}</span>
              <h2 className="mt-5 text-[25px] font-semibold leading-tight text-foreground">{card.h}</h2>
              <p className="mt-3 max-w-[280px] text-[16px] leading-[1.7] text-muted-foreground">{card.p}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary px-6 py-24 text-primary-foreground md:py-32">
        <div className="mx-auto grid max-w-[1080px] gap-14 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/65">The process</p>
            <h2 className="mt-5 text-[40px] font-semibold leading-[1.05] md:text-[54px]">{t("home.how")}</h2>
          </div>
          <ol className="divide-y divide-primary-foreground/20 border-y border-primary-foreground/20">
            {steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[44px_1fr] gap-4 py-7">
                <span className="text-[13px] font-semibold text-primary-foreground/60">0{index + 1}</span>
                <p className="text-[18px] leading-[1.6] text-primary-foreground/90">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1080px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">{t("home.exampleLabel")}</p>
          <Link to="/topics/type-2-diabetes" className="group mt-8 grid gap-8 border-y border-border py-10 md:grid-cols-[1fr_auto] md:items-end md:py-14">
            <div className="max-w-[760px]">
              <h2 className="text-[38px] font-semibold leading-[1.08] text-foreground transition-colors group-hover:text-primary md:text-[56px]">{t("home.exampleTitle")}</h2>
              <p className="mt-5 max-w-[620px] text-[17px] leading-[1.7] text-muted-foreground">{t("home.exampleSub")}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary underline underline-offset-4">
              {t("home.exampleRead")} <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      <section className="bg-secondary px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1080px] items-center gap-14 md:grid-cols-[1.15fr_0.85fr] md:gap-24">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Smartphone className="h-4 w-4" /> iOS app — June 30
            </div>
            <h2 className="mt-6 max-w-[650px] text-[40px] font-semibold leading-[1.05] text-foreground md:text-[56px]">Track your health. Understand what changed.</h2>
            <p className="mt-6 max-w-[650px] text-[17px] leading-[1.7] text-muted-foreground">A mobile companion that brings your health data and visit notes together, then explains them in plain English.</p>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {[
              { icon: Heart, text: "Syncs with Apple Health and Android equivalents" },
              { icon: Activity, text: "Explains trends, vitals, and changes clearly" },
              { icon: Smartphone, text: "Keeps visit notes ready when you need them" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-4 py-6 text-[16px] text-foreground">
                <item.icon className="h-5 w-5 shrink-0 text-primary" /> {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background px-6 py-24 text-center md:py-32">
        <div className="mx-auto max-w-[760px]">
          <h2 className="text-[42px] font-semibold leading-[1.05] text-foreground md:text-[62px]">{t("home.finalH")}</h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.7] text-muted-foreground">{t("home.finalNote")}</p>
          <Link to="/ask" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-foreground transition-transform hover:scale-[1.02] press-scale">
            {t("home.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;