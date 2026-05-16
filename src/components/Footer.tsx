import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, Stethoscope, Heart } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer
      className="relative mt-24 md:mt-32 px-6 pt-16 pb-10 overflow-hidden"
      style={{ backgroundColor: "hsl(var(--secondary) / 0.35)", borderTop: "1px solid hsl(var(--border) / 0.6)" }}
      role="contentinfo"
    >
      <div className="blob" style={{ background: "hsl(var(--primary) / 0.18)", width: 320, height: 320, bottom: -120, left: -100 }} />

      <div className="relative mx-auto mb-12 max-w-[720px]">
        <NewsletterSignup />
      </div>

      <div
        className="relative mx-auto grid max-w-[1180px] grid-cols-1 gap-12 md:grid-cols-[1.3fr,1fr,1fr,1fr]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div>
          <Link to="/" className="flex items-center gap-2 text-[18px] font-semibold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground text-[13px] font-bold">C</span>
            Clarify Health
          </Link>
          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-muted-foreground">
            Clear, trustworthy health education in plain English. Built so you can walk into any appointment understanding what's going on.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
            <li className="flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-primary" /> Clinician-reviewed</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> No ads</li>
          </ul>
        </div>

        <FooterCol title="Explore" links={[
          { to: "/topics", label: t("nav.topics") },
          { to: "/ask", label: t("nav.ask") },
          { to: "/find-a-doctor", label: t("nav.findDoctor") },
          { to: "/wellness-plan", label: t("nav.wellnessPlan") },
        ]} />

        <FooterCol title="About" links={[
          { to: "/about", label: t("nav.about") },
          { to: "/login", label: t("auth.login") },
          { to: "/signup", label: t("auth.signup") },
        ]} />

        <FooterCol title="Legal" links={[
          { to: "/privacy", label: "Privacy" },
          { to: "/terms", label: "Terms" },
          { to: "/disclaimer", label: "Medical disclaimer" },
          { to: "/rss", label: "RSS feed" },
        ]} />
      </div>

      <div
        className="relative mx-auto mt-14 flex max-w-[1180px] flex-col items-start justify-between gap-3 border-t pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center"
        style={{ borderColor: "hsl(var(--border) / 0.6)", fontFamily: "Inter, sans-serif" }}
      >
        <span>{t("footer.copyright")}</span>
        <span className="flex items-center gap-1.5">
          Made with <Heart className="h-3.5 w-3.5 text-accent" aria-hidden="true" fill="currentColor" /> for clearer healthcare.
        </span>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <div>
    <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/70" style={{ fontFamily: "Inter, sans-serif" }}>
      {title}
    </h3>
    <ul className="mt-4 space-y-2.5">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
