import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, ChevronDown, LogOut, FileText, Leaf,
  Sun, Moon, Contrast, Search, Type,
} from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useA11yPrefs } from "@/hooks/useA11yPrefs";

const LANGUAGE_OPTIONS: { code: Language; flag: string; name: string }[] = [
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}", name: "English" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", name: "Español" },
  { code: "ar", flag: "\u{1F1F8}\u{1F1E6}", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "hi", flag: "\u{1F1EE}\u{1F1F3}", name: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "ur", flag: "\u{1F1F5}\u{1F1F0}", name: "\u0627\u0631\u062F\u0648" },
];

const LanguageDropdown = ({ mobile = false }: { mobile?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGE_OPTIONS.find((o) => o.code === lang) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
          mobile ? "text-[16px] py-2 px-3" : "text-[13px] px-3 py-2"
        } font-medium text-muted-foreground`}
        style={{
          fontFamily: "Inter, sans-serif",
          border: "1px solid hsl(var(--border))",
          borderRadius: "999px",
        }}
      >
        <span>{current.flag}</span>
        <span>{current.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute z-[60] mt-1 min-w-[160px] overflow-hidden bg-background shadow-lg"
          style={{
            border: "0.5px solid hsl(var(--border))",
            borderRadius: "6px",
            right: 0,
          }}
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLang(opt.code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3.5 transition-colors ${
                mobile ? "py-3 text-[15px]" : "py-2 text-[13px]"
              } ${
                lang === opt.code
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span>{opt.flag}</span>
              <span>{opt.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const A11yMenu = () => {
  const { scale, setScale, highContrast, setHighContrast, dark, setDark } = useA11yPrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Accessibility options"
        className="flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <Type className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-[220px] p-3 bg-popover shadow-card"
          style={{ border: "1px solid hsl(var(--border))", borderRadius: "14px" }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Text size</div>
          <div className="flex gap-1 mb-3">
            {(["sm","md","lg"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                aria-pressed={scale === s}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scale === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {s === "sm" ? "A−" : s === "md" ? "A" : "A+"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
          >
            <span className="flex items-center gap-2"><Contrast className="h-4 w-4" /> High contrast</span>
            <span className={`h-4 w-7 rounded-full transition-colors ${highContrast ? "bg-primary" : "bg-muted"} relative`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all ${highContrast ? "left-3.5" : "left-0.5"}`} />
            </span>
          </button>
          <button
            onClick={() => setDark(!dark)}
            aria-pressed={dark}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
          >
            <span className="flex items-center gap-2">{dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Dark mode</span>
            <span className={`h-4 w-7 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"} relative`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all ${dark ? "left-3.5" : "left-0.5"}`} />
            </span>
          </button>
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? "U");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute z-[60] mt-2 min-w-[180px] overflow-hidden bg-background shadow-lg"
          style={{ border: "0.5px solid hsl(var(--border))", borderRadius: "6px", right: 0 }}
        >
          <button
            onClick={() => { navigate("/my-notes"); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <FileText className="h-3.5 w-3.5" />
            {t("auth.myNotes")}
          </button>
          <button
            onClick={() => { navigate("/wellness-plan"); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Leaf className="h-3.5 w-3.5" />
            {t("nav.wellnessPlan")}
          </button>
          <div style={{ borderTop: "0.5px solid hsl(var(--border))" }} />
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  const navLinks = [
    { to: "/topics", label: t("nav.topics") },
    { to: "/find-a-doctor", label: t("nav.findDoctor") },
    { to: "/ask", label: t("nav.ask") },
    { to: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ask?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled && !mobileOpen
            ? "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
            : "bg-background/40 backdrop-blur-md"
        }`}
        style={{ borderBottom: scrolled && !mobileOpen ? "1px solid hsl(var(--border) / 0.6)" : "1px solid transparent" }}
        role="banner"
      >
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-6">
          <Link
            to="/"
            aria-label="Clarify Health — home"
            className="relative z-50 flex items-center gap-2 text-[17px] font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground text-[13px] font-bold" style={{ fontFamily: "Fraunces, serif" }}>
              C
            </span>
            Clarify Health
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link-underline text-[13px] font-medium tracking-wide transition-colors hover:text-foreground ${
                  location.pathname.startsWith(link.to)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              role="search"
              className={`flex items-center transition-all duration-300 overflow-hidden ${
                searchOpen ? "w-[240px]" : "w-9"
              }`}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "999px",
                background: "hsl(var(--background) / 0.6)",
              }}
            >
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics…"
                  aria-label="Search"
                  className="h-9 w-full bg-transparent pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              )}
            </form>

            <A11yMenu />
            <LanguageDropdown />

            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    to="/signup"
                    className="text-[13px] font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all press-scale shadow-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {t("auth.signup")}
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <A11yMenu />
            <button
              className="relative z-50 p-2 -mr-2 press-scale transition-transform"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="nav-overlay fixed inset-0 z-40 flex flex-col items-start justify-center bg-background px-10 md:hidden">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`nav-overlay-link text-[36px] font-medium leading-tight transition-colors hover:text-primary ${
                  location.pathname.startsWith(link.to)
                    ? "text-primary"
                    : "text-foreground"
                }`}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <Link
                  to="/my-notes"
                  onClick={() => setMobileOpen(false)}
                  className="nav-overlay-link text-[36px] font-medium leading-tight transition-colors hover:text-primary text-foreground"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    animationDelay: `${navLinks.length * 80}ms`,
                  }}
                >
                  {t("auth.myNotes")}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="nav-overlay-link text-[36px] font-medium leading-tight transition-colors hover:text-primary text-foreground"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    animationDelay: `${navLinks.length * 80}ms`,
                  }}
                >
                  {t("auth.login")}
                </Link>
              )
            )}
          </nav>

          {/* Mobile language dropdown */}
          <div
            className="nav-overlay-link mt-10"
            style={{ animationDelay: `${(navLinks.length + 1) * 80}ms` }}
          >
            <LanguageDropdown mobile />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
