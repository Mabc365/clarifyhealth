import { useState } from "react";
import { Loader2, AlertTriangle, Stethoscope, Heart, ListChecks, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PageMeta from "@/components/PageMeta";

type Result = {
  what_it_might_relate_to: string;
  things_to_track: string[];
  self_care_tips: string[];
  when_to_see_doctor: string[];
  red_flags: string[];
  disclaimer: string;
};

const Section = ({ icon: Icon, title, items, tone = "default" }: { icon: any; title: string; items: string[]; tone?: "default" | "warn" | "danger" }) => {
  if (!items?.length) return null;
  const toneClasses = tone === "danger"
    ? "border-destructive/40 bg-destructive/5"
    : tone === "warn" ? "border-accent/40 bg-accent/5" : "border-border bg-card";
  const iconClasses = tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-primary";
  return (
    <section className={`rounded-2xl border p-6 ${toneClasses}`}>
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
        <Icon className={`h-5 w-5 ${iconClasses}`} /> {title}
      </h3>
      <ul className="space-y-2 text-[16px] leading-[1.7]">
        {items.map((i, idx) => (
          <li key={idx} className="flex gap-2"><span className="text-muted-foreground">•</span><span>{i}</span></li>
        ))}
      </ul>
    </section>
  );
};

const SymptomExplainerPage = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const { toast } = useToast();

  const explain = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("symptom-explain", { body: { description: text } });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't explain", description: error.message, variant: "destructive" });
      return;
    }
    setResult(data as Result);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-background">
      <PageMeta title="Symptom Explainer — Clarify Health" description="Describe what you're feeling. Get plain-English context about what body system it may relate to. Not a diagnosis." />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3 w-3" /> AI-powered · Not a diagnoser
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
            Symptom Explainer
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Describe what you're feeling in your own words. We'll explain what body systems it may relate to — and the red-flag signs that mean go to the ER.
          </p>
        </header>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I've had a dull pressure in my chest for two days, worse when I climb stairs…"
            rows={6}
            maxLength={4000}
            className="w-full rounded-2xl border border-border bg-card p-5 text-[16px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            style={{ fontFamily: "Inter, sans-serif" }}
            aria-label="Describe your symptoms"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/4000</span>
            <Button onClick={explain} disabled={loading || !text.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking…</> : "Explain"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-10 space-y-5">
            {result.red_flags?.length > 0 && (
              <Section icon={AlertTriangle} title="Call 911 / Go to the ER if you have:" items={result.red_flags} tone="danger" />
            )}
            {result.what_it_might_relate_to && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
                  <Heart className="h-5 w-5 text-primary" /> What this may relate to
                </h3>
                <p className="text-[17px] leading-[1.7]">{result.what_it_might_relate_to}</p>
              </section>
            )}
            <Section icon={ListChecks} title="Things to track for your doctor" items={result.things_to_track} />
            <Section icon={Heart} title="General self-care tips" items={result.self_care_tips} />
            <Section icon={Stethoscope} title="When to see a doctor (non-urgent)" items={result.when_to_see_doctor} tone="warn" />
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-4">{result.disclaimer}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SymptomExplainerPage;