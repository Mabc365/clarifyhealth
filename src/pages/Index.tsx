import { Link } from "react-router-dom";
import { ArrowUpRight, Smartphone } from "lucide-react";
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

      <section className="home-hero relative min-h-[92svh] overflow-hidden md:min-h-[100svh]" aria-labelledby="home-title">
        <img
          src={heroImage}
          alt="A patient and clinician calmly reviewing a health report together"
          width={1920}
          height={1280}
          className="home-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-[1240px] flex-col items-start justify-end px-6 pb-14 pt-40 text-left text-primary-foreground md:min-h-[100svh] md:items-center md:justify-center md:pb-12 md:pt-36 md:text-center">
          <p className="micro-label mb-6 text-primary-foreground/75">Clear health information</p>
          <h1 id="home-title" className="max-w-[1040px] text-[38px] font-medium leading-[1.08] sm:text-[46px] md:text-[72px] md:leading-[1.02] lg:text-[82px]">
            {t("home.hero")}
          </h1>
          <p className="mt-6 max-w-[610px] text-[16px] leading-[1.65] text-primary-foreground/85 md:text-[18px]">
            {t("home.sub")}
          </p>
          <Link to="/topics" className="primary-action mt-8">
            {t("home.ctaTopics")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 md:py-56" aria-label="Introducing Clarify Health">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="micro-label text-muted-foreground">{t("home.introLabel")}</p>
          <h2 className="mt-7 text-[32px] font-medium leading-[1.12] text-foreground md:text-[68px]">
            {t("home.introTitle")}
          </h2>
          <p className="mt-7 text-[14px] text-muted-foreground">{t("home.introSub")}</p>
        </div>
      </section>

      <section className="border-y border-border bg-background py-20 md:py-36" aria-labelledby="why-title">
        <div className="mx-auto max-w-[1180px] px-5 md:px-8">
          <h2 id="why-title" className="max-w-[900px] text-[32px] font-medium leading-[1.12] text-foreground md:text-[52px]">
            {t("home.trustTitle")}
          </h2>
          <div className="mt-16 grid border-y border-border md:grid-cols-3">
            {cards.map((card, index) => (
              <article key={card.h} className="border-b border-border py-9 last:border-b-0 md:min-h-[245px] md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <p className="micro-label text-accent">0{index + 1}</p>
                <h3 className="mt-10 text-[24px] font-medium leading-tight text-foreground">{card.h}</h3>
                <p className="mt-4 max-w-[290px] text-[15px] leading-[1.65] text-muted-foreground">{card.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-20 md:py-44" aria-labelledby="process-title">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="micro-label text-accent">The process</p>
            <h2 id="process-title" className="mt-7 text-[32px] font-medium leading-[1.12] text-foreground md:text-[58px]">{t("home.how")}</h2>
          </div>

          <div className="mt-16 overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="border-b border-border p-7 md:min-h-[190px] md:border-b-0 md:border-r md:p-8 md:last:border-r-0">
                  <span className="micro-label text-accent">Step 0{index + 1}</span>
                  <p className="mt-12 text-[17px] leading-[1.55] text-foreground">{step}</p>
                </div>
              ))}
            </div>
            <div className="relative h-[280px] border-t border-border md:h-[440px]">
              <img src={heroImage} alt="A health conversation in progress" loading="lazy" className="h-full w-full object-cover object-center grayscale" />
              <div className="absolute bottom-0 left-0 max-w-[470px] bg-card p-6 md:p-9">
                <p className="micro-label text-accent">{t("home.nextStep")}</p>
                <p className="mt-3 text-[20px] font-medium leading-snug text-foreground md:text-[25px]">{t("home.nextStepText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-6 py-20 text-primary-foreground md:py-40" aria-labelledby="example-title">
        <div className="mx-auto max-w-[1100px]">
          <p className="micro-label text-accent">{t("home.exampleLabel")}</p>
          <div className="mt-12 grid items-end gap-12 md:grid-cols-[1fr_280px]">
            <h2 id="example-title" className="max-w-[780px] text-[34px] font-medium leading-[1.12] md:text-[70px]">{t("home.exampleTitle")}</h2>
            <div>
              <p className="text-[15px] leading-[1.7] text-primary-foreground/72">{t("home.exampleSub")}</p>
              <Link to="/topics/type-2-diabetes" className="mt-7 inline-flex items-center gap-2 text-[12px] font-bold uppercase text-accent underline decoration-accent underline-offset-4">
                {t("home.exampleRead")} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-6 py-20 md:py-40" aria-labelledby="app-title">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-16 md:grid-cols-[1fr_0.9fr] md:items-end">
            <div>
              <p className="micro-label flex items-center gap-2 text-accent"><Smartphone className="h-4 w-4" /> iOS app · June 30</p>
              <h2 id="app-title" className="mt-8 max-w-[680px] text-[32px] font-medium leading-[1.12] text-foreground md:text-[62px]">Track your health. Understand what changed.</h2>
            </div>
            <div className="border-y border-border">
              {["Syncs with Apple Health and Android equivalents", "Explains trends, vitals, and changes clearly", "Keeps visit notes ready when you need them"].map((item, index) => (
                <p key={item} className="grid grid-cols-[38px_1fr] border-b border-border py-5 text-[14px] text-foreground last:border-b-0">
                  <span className="micro-label text-accent">0{index + 1}</span>{item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-20 text-center md:py-52">
        <div className="mx-auto max-w-[880px]">
          <h2 className="text-[34px] font-medium leading-[1.12] text-foreground md:text-[72px]">{t("home.finalH")}</h2>
          <p className="mt-5 text-[14px] text-muted-foreground">{t("home.finalNote")}</p>
          <Link to="/topics" className="primary-action mt-8">{t("home.ctaTopics")} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
};

export default Index;