import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, FileText, Leaf, LogOut, Menu, X } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@/assets/logo.png";

const LANGUAGE_OPTIONS: { code: Language; flag: string; name: string }[] = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
  { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
  { code: "ur", flag: "🇵🇰", name: "اردو" },
];

const LanguageDropdown = ({ mobile = false }: { mobile?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGE_OPTIONS.find((option) => option.code === lang) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((value) => !value)} aria-haspopup="listbox" aria-expanded={open} aria-label="Change language" className={`inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground ${mobile ? "py-2 text-[14px]" : "text-[11px]"}`}>
        <span aria-hidden="true">{current.flag}</span><span>{current.name}</span><ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute z-[70] mt-3 min-w-[170px] overflow-hidden rounded-lg border border-border bg-background shadow-soft ${mobile ? "left-0" : "right-0"}`} role="listbox">
          {LANGUAGE_OPTIONS.map((option) => (
            <button key={option.code} onClick={() => { setLang(option.code); setOpen(false); }} className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] transition-colors hover:bg-muted ${lang === option.code ? "text-accent" : "text-foreground"}`} role="option" aria-selected={lang === option.code}>
              <span aria-hidden="true">{option.flag}</span><span>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const initials = user?.user_metadata?.display_name?.slice(0, 2).toUpperCase() ?? user?.email?.slice(0, 2).toUpperCase() ?? "U";

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">{initials}</button>
      {open && (
        <div className="absolute right-0 z-[70] mt-3 min-w-[190px] overflow-hidden rounded-lg border border-border bg-background py-1 shadow-soft">
          <button onClick={() => { navigate("/my-notes"); setOpen(false); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] text-foreground hover:bg-muted"><FileText className="h-4 w-4" />{t("auth.myNotes")}</button>
          <button onClick={() => { navigate("/wellness-plan"); setOpen(false); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] text-foreground hover:bg-muted"><Leaf className="h-4 w-4" />{t("nav.wellnessPlan")}</button>
          <button onClick={() => { signOut(); setOpen(false); }} className="flex w-full items-center gap-2.5 border-t border-border px-4 py-3 text-[13px] text-muted-foreground hover:bg-muted"><LogOut className="h-4 w-4" />{t("auth.signOut")}</button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const navLinks = [
    { to: "/topics", label: t("nav.topics") },
    { to: "/tools", label: "Tools" },
    { to: "/about", label: t("nav.about") },
  ];

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6" role="banner">
        <div className="pointer-events-auto mx-auto max-w-[1040px] overflow-visible rounded-lg border border-border/80 bg-background/90 shadow-soft backdrop-blur-xl">
          <div className="flex h-[54px] items-center justify-between px-4 md:px-5">
            <Link to="/" aria-label="Clarify Health — home" className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <img src={logoUrl} alt="" className="h-8 w-8 object-contain dark:invert" />
              <span className="hidden sm:inline">Clarify Health</span>
            </Link>
            <p className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-[12px] font-medium text-foreground md:block">Health information, made clear.</p>
            <div className="hidden items-center gap-4 md:flex">
              <LanguageDropdown />
              {!loading && (user ? <UserMenu /> : <>
                <Link to="/login" className="text-[11px] font-medium text-muted-foreground hover:text-foreground">{t("auth.login")}</Link>
                <Link to="/signup" className="primary-action !px-4 !py-2 !text-[10px]">{t("auth.signup")}</Link>
              </>)}
            </div>
            <button onClick={() => setMobileOpen((value) => !value)} className="p-2 text-foreground md:hidden" aria-label="Toggle menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <nav className="hidden h-[38px] grid-cols-3 border-t border-border/70 md:grid" aria-label="Main">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`flex items-center justify-center border-r border-border/70 text-[11px] transition-colors last:border-r-0 hover:bg-muted ${location.pathname.startsWith(link.to) ? "text-accent" : "text-foreground"}`}>{link.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="nav-overlay fixed inset-0 z-40 flex flex-col justify-center bg-primary px-8 text-primary-foreground md:hidden">
          <nav className="flex flex-col border-y border-primary-foreground/20">
            {navLinks.map((link, index) => (
              <Link key={link.to} to={link.to} className={`nav-overlay-link flex items-center justify-between border-b border-primary-foreground/20 py-5 text-[30px] font-medium last:border-b-0 ${location.pathname.startsWith(link.to) ? "text-accent" : "text-primary-foreground"}`} style={{ animationDelay: `${index * 70}ms` }}>
                {link.label}<span className="micro-label">0{index + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-9 flex items-center justify-between">
            <LanguageDropdown mobile />
            {!loading && (user ? <Link to="/my-notes" className="text-[13px] font-semibold text-accent">{t("auth.myNotes")}</Link> : <div className="flex items-center gap-4"><Link to="/login" className="text-[13px]">{t("auth.login")}</Link><Link to="/signup" className="primary-action !px-4 !py-2 !text-[10px]">{t("auth.signup")}</Link></div>)}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;