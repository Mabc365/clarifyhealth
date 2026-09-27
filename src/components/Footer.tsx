import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoUrl from "@/assets/logo.png";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-primary-foreground/15 bg-primary px-5 pb-8 pt-20 text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 border-b border-primary-foreground/20 pb-16 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <Link to="/" className="flex items-center gap-3 text-[15px] font-semibold"><img src={logoUrl} alt="" className="h-9 w-9 object-contain invert" />Clarify Health</Link>
            <h2 className="mt-10 max-w-[650px] text-[38px] font-medium leading-[1.08] md:text-[52px]">Health information should make sense.</h2>
          </div>
          <div className="md:text-right">
            <p className="text-[14px] leading-[1.7] text-primary-foreground/65">Educational health information in plain English.<br />Not medical advice.</p>
            <Link to="/ask" className="mt-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase text-accent underline decoration-accent underline-offset-4">Ask a health question <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-3">
          <FooterCol title="Site" links={[{ to: "/topics", label: "Topics" }, { to: "/tools", label: "Tools" }, { to: "/ask", label: "Ask" }, { to: "/about", label: "About" }]} />
          <FooterCol title="Resources" links={[{ to: "/editorial-standards", label: "Editorial standards" }, { to: "/reviewers", label: "Reviewers" }, { to: "/contact", label: "Contact" }]} />
          <FooterCol title="Legal" links={[{ to: "/legal/privacy", label: "Privacy" }, { to: "/legal/terms", label: "Terms" }, { to: "/legal/ai-disclaimer", label: "AI disclaimer" }, { to: "/legal/cookies", label: "Cookies" }, { to: "/accessibility", label: "Accessibility" }]} />
        </div>
        <div className="border-t border-primary-foreground/20 pt-7 text-[11px] text-primary-foreground/50">{t("footer.copyright")} · Educational only — not medical advice.</div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <div><h3 className="micro-label text-primary-foreground/45">{title}</h3><ul className="mt-6 space-y-3">{links.map((link) => <li key={link.to}><Link to={link.to} className="text-[13px] text-primary-foreground/70 hover:text-primary-foreground">{link.label}</Link></li>)}</ul></div>
);

export default Footer;