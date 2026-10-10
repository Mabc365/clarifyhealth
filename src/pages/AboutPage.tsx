import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";
import mustafaPhoto from "@/assets/mustafa.jpeg";

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <main className="page-shell">
      <PageMeta title={t("about.meta.title")} description={t("about.meta.desc")} canonical="/about" jsonLd={{ "@type": "AboutPage", name: "About Clarify Health", description: t("about.meta.desc") }} />
      <header className="page-intro">
        <p className="micro-label text-accent">Our purpose</p>
        <h1>{t("about.title")}</h1>
        <p>Health information is useful only when people can understand it.</p>
      </header>

      <div className="border-t border-border">
        <section className="editorial-row">
          <h2>{t("about.why")}</h2>
          <div className="space-y-6"><p>{t("about.p1")}</p><p>{t("about.p2")}</p></div>
        </section>
        <section className="editorial-row">
          <h2>{t("about.how")}</h2>
          <div className="space-y-6"><p>{t("about.p3")}</p><p>{t("about.p4")}</p><p>{t("about.p5")}</p></div>
        </section>
        <section className="editorial-row">
          <h2>{t("about.who")}</h2>
          <figure className="grid gap-6 sm:grid-cols-[150px_1fr] sm:items-end">
            <img src={mustafaPhoto} alt="Mustafa Asif, founder of Clarify Health" loading="lazy" className="aspect-[4/5] w-[150px] rounded-lg object-cover grayscale" />
            <figcaption><p className="micro-label text-accent">Founder</p><p className="mt-4 text-[26px] font-medium text-foreground">Mustafa Asif</p><p className="mt-2 text-[14px] text-muted-foreground">Junior at Noor Ul Iman School, New Jersey</p></figcaption>
          </figure>
        </section>
        <section className="editorial-row">
          <h2>{t("about.important")}</h2>
          <p>{t("about.disclaimer")}</p>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
