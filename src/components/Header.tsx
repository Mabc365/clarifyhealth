import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, BookOpen, ChevronDown, FileText, HeartPulse, Leaf, LogOut, Menu, Stethoscope, X } from "lucide-react";
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
  const [activePreview, setActivePreview] = useState<number | null>(null);
  const [lastPreview, setLastPreview] = useState(0);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (activePreview !== null) setLastPreview(activePreview);
  }, [activePreview]);
  const navLinks = [
    {
      to: "/topics",
      label: t("nav.topics"),
      eyebrow: t("nav.preview.topics.label"),
      title: t("nav.preview.topics.title"),
      description: t("nav.preview.topics.desc"),
      kind: "topics",
    },
    {
      to: "/tools",
      label: t("nav.tools"),
      eyebrow: t("nav.preview.tools.label"),
      title: t("nav.preview.tools.title"),
      description: t("nav.preview.tools.desc"),
      kind: "tools",
    },
    {
      to: "/about",
      label: t("nav.about"),
      eyebrow: t("nav.preview.about.label"),
      title: t("nav.preview.about.title"),
      description: t("nav.preview.about.desc"),
      kind: "about",
    },
  ];

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-2 z-50 px-2 md:top-3 md:px-3" role="banner">
        <div
          className={`header-panel pointer-events-auto relative mx-auto max-w-[1180px] overflow-visible rounded-[18px] border border-border/80 bg-background/95 shadow-soft backdrop-blur-xl transition-shadow duration-300`}
          onMouseLeave={() => setActivePreview(null)}
        >
          <div className="grid h-[64px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-5">
            <Link to="/" aria-label="Clarify Health — home" className="flex w-fit items-center gap-2.5 text-foreground">
              <img src={logoUrl} alt="" className="h-9 w-9 object-contain dark:invert md:h-10 md:w-10" />
              <span className="block text-[12px] font-semibold leading-[1.05] md:hidden">Clarify<br />Health</span>
            </Link>
            <Link to="/" className="hidden text-[18px] font-medium text-foreground md:block">Clarify Health</Link>
            <div className="hidden items-center justify-end gap-4 md:flex">
              <LanguageDropdown />
              {!loading && (user ? <UserMenu /> : <>
                <Link to="/login" className="text-[11px] font-medium text-muted-foreground hover:text-foreground">{t("auth.login")}</Link>
                <Link to="/signup" className="primary-action !rounded-xl !px-5 !py-3 !text-[10px]">{t("auth.signup")} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </>)}
            </div>
            <div className="flex items-center justify-end gap-2 md:hidden">
              {!loading && !user && <Link to="/signup" className="primary-action !rounded-xl !px-4 !py-3 !text-[10px]">{t("auth.signup")} <ArrowUpRight className="h-3 w-3" /></Link>}
              <button onClick={() => setMobileOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center text-foreground" aria-label="Toggle menu" aria-expanded={mobileOpen}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <nav className="hidden h-[54px] grid-cols-3 border-t border-border/70 px-4 md:grid" aria-label="Main">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={() => setActivePreview(index)}
                onFocus={() => setActivePreview(index)}
                className={`flex h-full items-center justify-center gap-1.5 border-r border-border/70 text-[14px] font-medium transition-colors first:border-l hover:bg-muted focus-visible:bg-muted ${activePreview === index || location.pathname.startsWith(link.to) ? "bg-muted text-foreground" : "text-foreground"}`}
              >
                {link.label}<ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${activePreview === index ? "rotate-180" : ""}`} />
              </Link>
            ))}
          </nav>

          {activePreview !== null && navLinks[activePreview] && (
            <div className="absolute inset-x-[-1px] top-full hidden min-h-[300px] overflow-hidden rounded-b-[18px] border border-t-0 border-border/80 bg-background md:grid md:grid-cols-[1.08fr_.92fr]">
              <div className="flex flex-col justify-center px-10 py-10 lg:px-12">
                <span className="micro-label text-accent">{navLinks[activePreview].eyebrow}</span>
                <h2 className="mt-4 max-w-[500px] text-[32px] font-medium leading-[1.1] text-foreground">{navLinks[activePreview].title}</h2>
                <p className="mt-5 max-w-[540px] text-[16px] leading-[1.55] text-muted-foreground">{navLinks[activePreview].description}</p>
                <Link to={navLinks[activePreview].to} className="mt-8 inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase text-accent underline-offset-4 hover:underline">
                  {navLinks[activePreview].label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="m-6 ml-0 min-h-[252px] overflow-hidden rounded-lg bg-secondary">
                {navLinks[activePreview].kind === "topics" && (
                  <div className="flex h-full flex-col justify-between p-7">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <div className="space-y-3">
                      {["Type 2 diabetes", "High blood pressure", "Anxiety"].map((item, index) => <div key={item} className="flex items-center justify-between border-b border-primary/15 pb-3 text-[14px] font-medium"><span>0{index + 1}&nbsp;&nbsp; {item}</span><ArrowUpRight className="h-3.5 w-3.5" /></div>)}
                    </div>
                  </div>
                )}
                {navLinks[activePreview].kind === "tools" && (
                  <div className="grid h-full grid-cols-2 gap-px bg-border">
                    {[{ icon: FileText, name: "Jargon translator" }, { icon: HeartPulse, name: "Symptom explainer" }, { icon: Stethoscope, name: "Find a doctor" }, { icon: Leaf, name: "Visit notes" }].map(({ icon: Icon, name }) => <div key={name} className="flex flex-col justify-between bg-secondary p-5"><Icon className="h-6 w-6 text-primary" /><span className="text-[13px] font-semibold">{name}</span></div>)}
                  </div>
                )}
                {navLinks[activePreview].kind === "about" && (
                  <div className="relative h-full min-h-[252px]">
                    <img src={logoUrl} alt="" className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 dark:invert" />
                    <span className="micro-label absolute bottom-6 left-6 text-primary">Plain language. Better questions.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileOpen && (
            <div className="border-t border-border/70 px-4 pb-4 md:hidden">
              <nav className="flex flex-col" aria-label="Main">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={`flex min-h-[58px] items-center justify-center border-b border-border/70 text-[16px] font-medium ${location.pathname.startsWith(link.to) ? "bg-muted text-foreground" : "text-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex min-h-[54px] items-center justify-between px-2 pt-3">
                <LanguageDropdown mobile />
                {!loading && (user ? <Link to="/my-notes" className="text-[13px] font-semibold text-accent">{t("auth.myNotes")}</Link> : <Link to="/login" className="text-[13px] font-medium text-foreground">{t("auth.login")}</Link>)}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;