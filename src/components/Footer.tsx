import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer
      className="px-6 pt-16 pb-10 border-t"
      style={{ borderColor: "hsl(var(--border) / 0.5)" }}
      role="contentinfo"
    >
      <div
        className="mx-auto max-w-[1000px] grid grid-cols-1 md:grid-cols-[1.4fr,1fr,1fr,1fr] gap-10"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div>
          <Link to="/" className="flex items-center gap-2 text-[16px] font-medium text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground text-[13px] font-bold">C</span>
            Clarify Health
          </Link>
          <p className="mt-4 max-w-[300px] text-[14px] leading-relaxed text-muted-foreground">
            Plain-English health information. Educational only — not medical advice.
          </p>
        </div>

        <FooterCol title="Site" links={[
          { to: "/topics", label: "Topics" },
          { to: "/tools", label: "Tools" },
          { to: "/ask", label: "Ask" },
          { to: "/about", label: "About" },
        ]} />

        <FooterCol title="Resources" links={[
          { to: "/editorial-standards", label: "Editorial standards" },
          { to: "/reviewers", label: "Reviewers" },
          { to: "/contact", label: "Contact" },
        ]} />

        <FooterCol title="Legal" links={[
          { to: "/legal/privacy", label: "Privacy" },
          { to: "/legal/terms", label: "Terms" },
          { to: "/legal/ai-disclaimer", label: "AI disclaimer" },
          { to: "/legal/cookies", label: "Cookies" },
          { to: "/legal/do-not-sell", label: "Do Not Sell or Share My Info" },
          { to: "/accessibility", label: "Accessibility" },
        ]} />
      </div>

      <div
        className="mx-auto mt-12 max-w-[1000px] pt-6 text-[12px] text-muted-foreground border-t"
        style={{ borderColor: "hsl(var(--border) / 0.5)", fontFamily: "Inter, sans-serif" }}
      >
        {t("footer.copyright")} · Educational only — not medical advice.
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <div>
    <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-foreground/60">
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
