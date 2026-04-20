import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 md:mt-32 py-10 px-6" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
      <div className="mx-auto max-w-[1100px] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span>{t("footer.copyright")}</span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/topics" className="hover:text-foreground transition-colors">{t("nav.topics")}</Link>
          <Link to="/ask" className="hover:text-foreground transition-colors">{t("nav.ask")}</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">{t("nav.about")}</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/disclaimer" className="hover:text-foreground transition-colors">Medical Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
