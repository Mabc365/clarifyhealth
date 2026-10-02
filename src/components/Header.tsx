import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, BookOpen, ChevronDown, CreditCard, FileText, Leaf, LogOut, Menu, Settings, Stethoscope, X } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { getTopics } from "@/data/topics";
import { Button } from "@/components/ui/button";
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
        <div className={`absolute z-[70] mt-3 min-w-[170px] overflow-hidden rounded-lg border border-border bg-background shadow-soft animate-[fade-in_0.18s_ease-out] ${mobile ? "left-0" : "right-0"}`} role="listbox">
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
        <div className="absolute right-0 z-[70] mt-3 min-w-[190px] overflow-hidden rounded-lg border border-border bg-background py-1 shadow-soft animate-[fade-in_0.18s_ease-out]">
          <Button variant="ghost" onClick={() => { navigate("/account"); setOpen(false); }} className="h-auto w-full justify-start rounded-none px-4 py-3 text-[13px]"><Settings className="h-4 w-4" />{t("auth.settings")}</Button>
          <Button variant="ghost" onClick={() => { navigate("/manage-plan"); setOpen(false); }} className="h-auto w-full justify-start rounded-none px-4 py-3 text-[13px]"><CreditCard className="h-4 w-4" />Manage plan</Button>
          <Button variant="ghost" onClick={() => { signOut(); setOpen(false); }} className="h-auto w-full justify-start rounded-none border-t border-border px-4 py-3 text-[13px] text-muted-foreground"><LogOut className="h-4 w-4" />{t("auth.signOut")}</Button>
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
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const closeTimer = useRef<number>();
  const openPreview = (i: number) => { if (user) return; window.clearTimeout(closeTimer.current); setActivePreview(i); };
  const scheduleClose = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setActivePreview(null), 120); };

  useEffect(() => {
    if (activePreview !== null) setLastPreview(activePreview);
  }, [activePreview]);
  useEffect(() => setActivePreview(null), [location.pathname]);
  const guestLinks = [
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

  const navLinks = user
    ? [
        { ...guestLinks[0], to: "/dashboard", label: "Dashboard", kind: "plain" },
        { ...guestLinks[0], kind: "plain" },
        { ...guestLinks[1], kind: "plain" },
      ]
    : guestLinks;

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-2 z-50 px-2 md:top-4 md:px-3" role="banner">
        <div
          className={`header-panel pointer-events-auto relative mx-auto max-w-[680px] overflow-visible rounded-xl border border-border/60 bg-background/85 shadow-soft backdrop-blur-2xl transition-[background-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
          onMouseLeave={scheduleClose} onMouseEnter={() => window.clearTimeout(closeTimer.current)}
        >
          <div className="grid h-[54px] grid-cols-[1fr_auto_1fr] items-center px-4">
            <Link to="/" aria-label="Clarify Health — home" className="flex w-fit items-center gap-2.5 text-foreground">
              <img src={logoUrl} alt="" className="h-8 w-8 object-contain dark:invert" />
              <span className="block text-[14px] font-semibold leading-[1.05] md:hidden">Clarify<br />Health</span>
            </Link>
            <Link to="/" className="hidden text-[14px] font-medium text-foreground md:block">Clarify Health</Link>
            <div className="hidden items-center justify-end gap-4 md:flex">
              <LanguageDropdown />
              {user ? <UserMenu /> : <Button asChild className="h-9 rounded-full px-5 text-[11px] font-bold uppercase"><Link to="/login">{t("auth.login")}</Link></Button>}
            </div>
            <div className="flex items-center justify-end gap-2 md:hidden">
              {user ? <UserMenu /> : <Button asChild size="sm" className="rounded-full px-4 text-[12px]"><Link to="/login">{t("auth.login")}</Link></Button>}
              <button onClick={() => setMobileOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center text-foreground" aria-label="Toggle menu" aria-expanded={mobileOpen}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <nav className="hidden h-[40px] grid-cols-3 border-t border-border/60 px-3 md:grid" aria-label="Main">
            {navLinks.map((link, index) =>
                <Link
                  key={link.to}
                  to={link.to}
                  onMouseEnter={() => openPreview(index)}
                  onPointerEnter={(event) => { if (event.pointerType !== "touch") openPreview(index); }}
                  onFocus={() => openPreview(index)}
                  aria-expanded={!user ? activePreview === index : undefined}
                  className={`flex h-full items-center justify-center border-r border-border/60 text-[12px] font-medium transition-colors first:border-l hover:bg-muted/70 focus-visible:bg-muted ${activePreview === index || location.pathname.startsWith(link.to) ? "bg-muted/70 text-foreground" : "text-foreground"}`}
                >
                  {link.label}
                </Link>
            )}
          </nav>

          <div
            aria-hidden={activePreview === null}
            className={`hidden md:grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activePreview === null ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`grid grid-cols-[1.08fr_.92fr] border-t border-border/60 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${activePreview === null ? "pointer-events-none -translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
              >
            <div key={lastPreview} className="flex flex-col justify-center px-7 py-7 animate-[fade-in_0.35s_ease-out]">
              <span className="micro-label text-accent">{navLinks[lastPreview].eyebrow}</span>
              <h2 className="mt-3 max-w-[500px] text-[25px] font-medium leading-[1.1] text-foreground">{navLinks[lastPreview].title}</h2>
              <p className="mt-4 max-w-[540px] text-[13px] leading-[1.55] text-muted-foreground">{navLinks[lastPreview].description}</p>
              <Link to={navLinks[lastPreview].to} onClick={() => setActivePreview(null)} className="mt-6 inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase text-accent underline-offset-4 hover:underline">
                {navLinks[lastPreview].label}
              </Link>
            </div>
            <div key={`v${lastPreview}`} className="m-4 ml-0 min-h-[200px] overflow-hidden rounded-lg bg-secondary animate-[fade-in_0.35s_ease-out]">
              {navLinks[lastPreview].kind === "topics" && (
                <div className="flex h-full flex-col justify-between p-7">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div className="space-y-3">
                    {getTopics(lang).slice(0, 3).map((item, index) => <Link key={item.id} to={`/topics/${item.id}`} onClick={() => setActivePreview(null)} className="flex items-center justify-between border-b border-primary/15 pb-3 text-[14px] font-medium transition-colors hover:text-accent"><span>0{index + 1}&nbsp;&nbsp; {item.title}</span></Link>)}
                  </div>
                </div>
              )}
              {navLinks[lastPreview].kind === "tools" && (
                <div className="grid h-full grid-cols-2 gap-px bg-border">
                  {[{ icon: FileText, name: "Jargon translator", to: "/translate" }, { icon: BookOpen, name: "Glossary", to: "/glossary" }, { icon: Stethoscope, name: "Find a doctor", to: "/find-a-doctor" }, { icon: Leaf, name: "Visit notes", to: "/my-notes" }].map(({ icon: Icon, name, to }) => <Link key={name} to={to} onClick={() => setActivePreview(null)} className="flex flex-col justify-between bg-secondary p-5 transition-colors hover:bg-muted"><Icon className="h-6 w-6 text-primary" /><span className="text-[13px] font-semibold">{name}</span></Link>)}
                </div>
              )}
              {navLinks[lastPreview].kind === "about" && (
                <div className="relative h-full min-h-[252px]">
                  <img src={logoUrl} alt="" className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90 dark:invert" />
                  <span className="micro-label absolute bottom-6 left-6 text-primary">Plain language. Better questions.</span>
                </div>
              )}
            </div>
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-border/70 px-4 pb-4 animate-[fade-in_0.2s_ease-out] md:hidden">
              <nav className="flex flex-col" aria-label="Main">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={`flex min-h-[58px] items-center justify-center border-b border-border/70 text-[16px] font-medium ${location.pathname.startsWith(link.to) ? "bg-muted text-foreground" : "text-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex min-h-[54px] items-center px-2 pt-3">
                <LanguageDropdown mobile />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;