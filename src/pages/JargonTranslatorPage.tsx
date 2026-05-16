import { useState } from "react";
import { Copy, Printer, Loader2, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PageMeta from "@/components/PageMeta";

type Term = { term: string; definition: string };
type Result = { plain_english: string; terms: Term[]; disclaimer: string };

const renderWithTooltips = (text: string, terms: Term[]) => {
  if (!terms?.length) return text;
  // Build a regex that matches any term (case-insensitive, longest first to avoid partial overlaps)
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`\\b(${sorted.map((t) => t.term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")).join("|")})\\b`, "gi");
  const parts: (string | JSX.Element)[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const found = sorted.find((t) => t.term.toLowerCase() === match![0].toLowerCase());
    parts.push(
      <span
        key={`t-${i++}`}
        title={found?.definition}
        className="underline decoration-dotted decoration-primary/60 cursor-help font-medium text-foreground"
      >
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

const JargonTranslatorPage = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("jargon-translate", { body: { text } });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't translate", description: error.message, variant: "destructive" });
      return;
    }
    setResult(data as Result);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.plain_english}\n\n${result.disclaimer}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-background">
      <PageMeta title="Jargon Translator — Clarify Health" description="Paste a confusing lab report, discharge note, or insurance letter and get a plain-English version." />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3 w-3" /> AI-powered
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
            Jargon Translator
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Paste a lab report, discharge note, or insurance letter. We'll rewrite it in plain English and hover-explain every medical term.
          </p>
        </header>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste confusing medical text here…"
            rows={8}
            maxLength={8000}
            className="w-full rounded-2xl border border-border bg-card p-5 text-[16px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            style={{ fontFamily: "Inter, sans-serif" }}
            aria-label="Medical text to translate"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{text.length}/8000</span>
            <Button
              onClick={translate}
              disabled={loading || !text.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Translating…</> : <><FileText className="h-4 w-4 mr-2" /> Translate</>}
            </Button>
          </div>
        </div>

        {result && (
          <article className="mt-10 print-area">
            <div className="flex items-center justify-between mb-4 no-print">
              <h2 className="text-2xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Plain English</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy} className="rounded-full"><Copy className="h-4 w-4 mr-1.5" /> Copy</Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-full"><Printer className="h-4 w-4 mr-1.5" /> Print</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-[17px] leading-[1.7] whitespace-pre-wrap" style={{ fontFamily: "Inter, sans-serif" }}>
              {renderWithTooltips(result.plain_english, result.terms)}
            </div>

            {result.terms?.length > 0 && (
              <section className="mt-8">
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "Fraunces, serif" }}>Terms in this text</h3>
                <dl className="grid gap-3 md:grid-cols-2">
                  {result.terms.map((t) => (
                    <div key={t.term} className="rounded-xl border border-border bg-card p-4">
                      <dt className="font-semibold text-foreground">{t.term}</dt>
                      <dd className="text-sm text-muted-foreground mt-1">{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <p className="mt-8 text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-4">
              {result.disclaimer}
            </p>
          </article>
        )}
      </div>
    </main>
  );
};

export default JargonTranslatorPage;