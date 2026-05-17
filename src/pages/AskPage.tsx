import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PageMeta from "@/components/PageMeta";
import { trackQuestionAsked } from "@/lib/analytics";
import AIInputNotice from "@/components/AIInputNotice";

// ── Constants ─────────────────────────────────────────────────────────────

type Tab = "ask" | "diagnosis";

const HISTORY_KEY = "clarify_question_history";
const RATE_KEY = "clarify_rate_timestamps";
const MAX_HISTORY = 5;
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const WELLNESS_KEYWORDS = [
  "weight", "sleep", "stress", "smoking", "exercise",
  "diet", "eating", "fitness", "mental health", "anxiety", "mood",
];

interface SavedQuestion {
  question: string;
  answer: string;
  tab: Tab;
  timestamp: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function loadHistory(): SavedQuestion[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SavedQuestion[]) : [];
  } catch {
    return [];
  }
}

function saveToHistory(entry: SavedQuestion): SavedQuestion[] {
  const prev = loadHistory().filter((h) => h.question !== entry.question);
  const updated = [entry, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

function checkRateLimit(): boolean {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const stamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = stamps.filter((ts) => Date.now() - ts < WINDOW_MS);
    return recent.length < MAX_REQUESTS;
  } catch {
    return true;
  }
}

function recordRequest(): void {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const stamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = stamps.filter((ts) => Date.now() - ts < WINDOW_MS);
    recent.push(Date.now());
    localStorage.setItem(RATE_KEY, JSON.stringify(recent));
  } catch { /* noop */ }
}

function isWellness(q: string): boolean {
  const lower = q.toLowerCase();
  return WELLNESS_KEYWORDS.some((kw) => lower.includes(kw));
}

function getMode(tab: Tab, question: string): string {
  if (tab === "diagnosis") return "diagnosis";
  return isWellness(question) ? "wellness" : "general";
}

// ── Component ─────────────────────────────────────────────────────────────

const AskPage = () => {
  const [searchParams] = useSearchParams();
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<Tab>("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SavedQuestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    const q = searchParams.get("q");
    if (q) {
      setQuestion(q);
      handleAsk(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────

  const handleAsk = async (q?: string) => {
    const text = (q ?? question).trim();
    if (!text) return;

    if (!checkRateLimit()) {
      setError("rate_limit");
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error: fnError } = await supabase.functions.invoke("ask", {
        body: {
          question: text,
          mode: getMode(tab, text),
          language: lang,
        },
      });

      if (fnError) {
        setError(t("ask.error") ?? "Something went wrong. Please try again.");
        return;
      }

      recordRequest();
      trackQuestionAsked(tab, lang);
      setAnswer(data.answer);
      setHistory(
        saveToHistory({ question: text, answer: data.answer, tab, timestamp: Date.now() }),
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk();
  };

  const loadFromHistory = (entry: SavedQuestion) => {
    setTab(entry.tab ?? "ask");
    setQuestion(entry.question);
    setAnswer(entry.answer);
    setError("");
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setAnswer("");
    setError("");
  };

  // ── Render markdown-ish answer ────────────────────────────────────────

  const renderLine = (line: string, i: number) => {
    if (line.trim() === "---") {
      return <div key={i} className="my-6 h-px w-full bg-border" style={{ height: "0.5px" }} />;
    }
    if (/^\*\*.*\*\*$/.test(line)) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-[18px] font-semibold text-foreground first:mt-0" style={{ fontFamily: "'Playfair Display', serif" }}>
          {line.replace(/\*\*/g, "")}
        </h3>
      );
    }
    if (/^[-•]\s/.test(line)) {
      return (
        <p key={i} className="my-1.5 pl-4 text-[16px] leading-[1.75] text-foreground/80">
          {renderInline(line)}
        </p>
      );
    }
    if (/^\*[^*].*[^*]\*$/.test(line)) {
      return (
        <p key={i} className="mt-6 text-[14px] italic text-muted-foreground">
          {line.replace(/^\*|\*$/g, "")}
        </p>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="my-1.5 text-[16px] leading-[1.75] text-foreground/80">
        {renderInline(line)}
      </p>
    );
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g);
    return parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (/^https?:\/\//.test(part)) {
        return (
          <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
            {part}
          </a>
        );
      }
      return <span key={j}>{part}</span>;
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────

  const askExamples = [t("ask.example.cholesterol"), t("ask.example.anxiety"), t("ask.example.sleep")];
  const diagExamples = [t("ask.example.a1c"), t("ask.example.hypertension"), t("ask.example.tsh")];
  const examples = tab === "diagnosis" ? diagExamples : askExamples;

  const placeholder = tab === "diagnosis" ? t("ask.placeholder.diag") : t("ask.placeholder.ask");

  const heading = tab === "diagnosis" ? (
    <>{t("ask.heading.diag1")}<br />{t("ask.heading.diag2")}</>
  ) : (
    <>{t("ask.heading.ask1")}<br />{t("ask.heading.ask2")}</>
  );

  const subheading = tab === "diagnosis" ? t("ask.sub.diag") : t("ask.sub.ask");
  const submitLabel = tab === "diagnosis" ? t("ask.submit.diag") : t("ask.submit.ask");

  // ── JSX ───────────────────────────────────────────────────────────────

  return (
    <main className="pt-28 pb-[64px] md:pb-[120px] px-6">
      <PageMeta
        title={t("ask.meta.title")}
        description={t("ask.meta.desc")}
        canonical="/ask"
        jsonLd={{
          "@type": "WebPage",
          name: t("ask.meta.title"),
          description: t("ask.meta.desc"),
          potentialAction: {
            "@type": "AskAction",
            target: "https://clarifyhealth.lovable.app/ask",
          },
        }}
      />
      <div className="mx-auto max-w-[680px]">
        {/* Hero */}
        <div className="stagger-reveal">
          <h1 className="text-[44px] font-semibold leading-[1.1] text-foreground md:text-[56px]">
            {heading}
          </h1>
          <p className="mt-5 text-[18px] leading-relaxed text-muted-foreground md:text-[20px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {subheading}
          </p>
        </div>

        {/* Tabs */}
        <div className="stagger-reveal mt-10 flex items-center gap-4">
          <div className="flex gap-1" style={{ border: "0.5px solid hsl(var(--border))", borderRadius: "6px", padding: "3px" }}>
            {(["ask", "diagnosis"] as Tab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => switchTab(tabKey)}
                className="px-4 py-2 text-[13px] font-medium transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "4px",
                  background: tab === tabKey ? "hsl(var(--primary))" : "transparent",
                  color: tab === tabKey ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                {tabKey === "ask" ? t("ask.tab.ask") : t("ask.tab.diagnosis")}
              </button>
            ))}
          </div>
        </div>

        {/* Example pills */}
        <div className="stagger-reveal mt-6 flex flex-wrap gap-2">
          {examples.map((eq) => (
            <button
              key={eq}
              onClick={() => { setQuestion(eq); setAnswer(""); setError(""); }}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary active:scale-[0.98]"
              style={{ fontFamily: "'DM Sans', sans-serif", border: "0.5px solid hsl(var(--border))" }}
            >
              {eq}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="stagger-reveal mt-8">
          <AIInputNotice className="mb-3" />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            rows={tab === "diagnosis" ? 6 : 4}
            className="w-full resize-none bg-transparent p-4 text-[16px] placeholder:text-muted-foreground focus:outline-none transition-all"
            style={{ fontFamily: "'DM Sans', sans-serif", border: "0.5px solid hsl(var(--border))", borderRadius: "4px" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,74,0.15)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="mt-4 w-full py-3.5 text-[15px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "4px" }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="pulse-dot" style={{ animationDelay: "0ms" }} />
                <span className="pulse-dot" style={{ animationDelay: "160ms" }} />
                <span className="pulse-dot" style={{ animationDelay: "320ms" }} />
              </span>
            ) : submitLabel}
          </button>
        </form>

        {/* Rate-limit message */}
        {error === "rate_limit" && (
          <p className="mt-6 text-center text-[14px] font-medium animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif", color: "hsl(var(--primary))" }}>
            {t("ask.rateLimit")}
          </p>
        )}

        {/* Error */}
        {error && error !== "rate_limit" && (
          <div className="mt-6 rounded px-4 py-3 text-[14px] text-red-700 bg-red-50 animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif", border: "0.5px solid #fca5a5" }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-12">
            <div className="h-px w-full bg-border mb-10" style={{ height: "0.5px" }} />
            <div className="flex items-center gap-3 text-muted-foreground animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="inline-flex items-center gap-1.5">
                <span className="pulse-dot" style={{ animationDelay: "0ms" }} />
                <span className="pulse-dot" style={{ animationDelay: "160ms" }} />
                <span className="pulse-dot" style={{ animationDelay: "320ms" }} />
              </span>
              {t("ask.loading")}
            </div>
          </div>
        )}

        {/* Response */}
        {answer && !loading && !error && (
          <div className="mt-12">
            <div className="h-px w-full bg-border mb-10" style={{ height: "0.5px" }} />
            <div className="animate-fade-in" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {answer.split("\n").map(renderLine)}
            </div>
          </div>
        )}

        {/* Recent Questions */}
        {history.length > 0 && (
          <div className="mt-16">
            <div className="h-px w-full bg-border mb-6" style={{ height: "0.5px" }} />
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Clock className="h-4 w-4" />
              {t("ask.recentQuestions")} ({history.length})
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showHistory && (
              <ul className="mt-4 space-y-2 animate-fade-in">
                {history.map((entry) => (
                  <li key={entry.timestamp}>
                    <button
                      onClick={() => loadFromHistory(entry)}
                      className="w-full text-left rounded px-4 py-3 text-[14px] text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors truncate"
                      style={{ fontFamily: "'DM Sans', sans-serif", border: "0.5px solid hsl(var(--border))", borderRadius: "4px" }}
                    >
                      {entry.question}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AskPage;
