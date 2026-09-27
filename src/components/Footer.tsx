import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logoUrl from "@/assets/logo.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-primary-foreground/15 bg-primary px-6 pb-10 pt-16 text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-col justify-between gap-8 border-b border-primary-foreground/20 pb-12 md:flex-row md:items-end">
          <div>
            <Link to="/" className="flex items-center gap-2 text-[17px] font-semibold" style={{ fontFamily: "Sora, sans-serif" }}>
              <img src={logoUrl} alt="" className="h-9 w-9 object-contain invert" />
              Clarify Health
            </Link>
            <p className="mt-4 max-w-[460px] text-[15px] leading-[1.7] text-primary-foreground/70">
              Plain-English health information. Educational only — not medical advice.
            </p>
          </div>
          <Link to="/ask" className="inline-flex w-fit items-center rounded-full bg-accent px-6 py-3 text-[14px] font-semibold text-accent-foreground transition-transform hover:scale-[1.02]">
            Ask a health question
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-3">
          <FooterCol title="Site" links={[
            { to: "/topics", label: "Topics" }, { to: "/tools", label: "Tools" },
            { to: "/ask", label: "Ask" }, { to: "/about", label: "About" },
          ]} />
          <FooterCol title="Resources" links={[
            { to: "/editorial-standards", label: "Editorial standards" },
            { to: "/reviewers", label: "Reviewers" }, { to: "/contact", label: "Contact" },
          ]} />
          <FooterCol title="Legal" links={[
            { to: "/legal/privacy", label: "Privacy" }, { to: "/legal/terms", label: "Terms" },
            { to: "/legal/ai-disclaimer", label: "AI disclaimer" },
            { to: "/legal/cookies", label: "Cookies" }, { to: "/accessibility", label: "Accessibility" },
          ]} />
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-[12px] text-primary-foreground/60">
          {t("footer.copyright")} · Educational only — not medical advice.
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <div>
    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/55">{title}</h3>
    <ul className="mt-5 space-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="text-[14px] text-primary-foreground/75 transition-colors hover:text-primary-foreground">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;