import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, Printer, Loader2, Sparkles, AlertTriangle, MessageSquare, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/PageMeta";
import { useToast } from "@/hooks/use-toast";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  tldr: string[];
  reading_grade: number;
  read_time_min: number;
  last_reviewed: string;
  reviewer_name: string;
  reviewer_credentials: string;
  sections: { label: string; title: string; content: string }[];
  when_to_call: string[];
  questions_to_ask: string[];
  sources: { name: string; url: string }[];
};

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [eli5Map, setEli5Map] = useState<Record<number, string>>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from("articles").select("*").eq("slug", slug).eq("language", "en").maybeSingle().then(({ data }) => {
      setArticle(data as unknown as Article | null);
      setLoading(false);
    });
  }, [slug]);

  const articleText = () => {
    if (!article) return "";
    const parts = [article.title, ...(article.tldr ?? []), ...(article.sections ?? []).flatMap((s) => [s.title, s.content])];
    return parts.join(". ");
  };

  const generateAudio = async () => {
    if (!article) return;
    if (audioUrl) {
      if (playing) { audio?.pause(); setPlaying(false); } else { audio?.play(); setPlaying(true); }
      return;
    }
    setAudioLoading(true);
    const { data, error } = await supabase.functions.invoke("tts-speak", { body: { text: articleText().slice(0, 3800), speed } });
    setAudioLoading(false);
    if (error || !data) { toast({ title: "Audio failed", variant: "destructive" }); return; }
    const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    const a = new Audio(url);
    a.playbackRate = speed;
    a.onended = () => setPlaying(false);
    setAudio(a);
    a.play();
    setPlaying(true);
  };

  const rewriteEli5 = async (idx: number, content: string) => {
    setEli5Loading(true);
    const { data, error } = await supabase.functions.invoke("eli5-rewrite", { body: { text: content, mode: "eli5" } });
    setEli5Loading(false);
    if (error || !data) { toast({ title: "Couldn't rewrite", variant: "destructive" }); return; }
    setEli5Map((m) => ({ ...m, [idx]: (data as any).text }));
  };

  if (loading) return <main className="min-h-screen pt-32 px-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></main>;
  if (!article) return (
    <main className="min-h-screen pt-32 px-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Article not found</h1>
      <Link to="/topics" className="text-primary underline">Browse all topics</Link>
    </main>
  );

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 bg-background">
      <PageMeta title={`${article.title} — Clarify Health`} description={article.summary ?? article.tldr?.[0] ?? ""} canonical={`/article/${article.slug}`} />
      <article className="mx-auto max-w-3xl print-area">
        <Link to="/topics" className="text-sm text-muted-foreground hover:text-primary inline-block mb-6 no-print">← All topics</Link>

        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-tight" style={{ fontFamily: "Fraunces, serif" }}>{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>📖 {article.read_time_min} min read</span>
            <span>·</span>
            <span>Grade {article.reading_grade} reading level</span>
            <span>·</span>
            <span>Reviewed {new Date(article.last_reviewed).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-8 no-print">
          <Button onClick={generateAudio} disabled={audioLoading} variant="outline" size="sm" className="rounded-full">
            {audioLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : playing ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
            {playing ? "Pause" : "Listen"}
          </Button>
          {audioUrl && (
            <select
              value={speed}
              onChange={(e) => { const s = Number(e.target.value); setSpeed(s); if (audio) audio.playbackRate = s; }}
              className="rounded-full border border-border bg-card text-sm px-3"
              aria-label="Playback speed"
            >
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
              <option value={1.25}>1.25×</option>
              <option value={1.5}>1.5×</option>
            </select>
          )}
          <Button onClick={() => window.print()} variant="outline" size="sm" className="rounded-full"><Printer className="h-4 w-4 mr-1.5" /> Print / PDF</Button>
        </div>

        {article.tldr?.length > 0 && (
          <section className="rounded-2xl border-l-4 border-primary bg-primary/5 p-6 mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">In short</h2>
            <ul className="space-y-2 text-[17px] leading-[1.7]">
              {article.tldr.map((t, i) => <li key={i} className="flex gap-2"><span>•</span><span>{t}</span></li>)}
            </ul>
          </section>
        )}

        <div className="space-y-10">
          {article.sections.map((s, i) => (
            <section key={i}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{s.label}</p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ fontFamily: "Fraunces, serif" }}>{s.title}</h2>
              <p className="text-[17px] leading-[1.75] whitespace-pre-wrap" style={{ fontFamily: "Inter, sans-serif" }}>
                {eli5Map[i] ?? s.content}
              </p>
              <button
                onClick={() => eli5Map[i] ? setEli5Map((m) => { const c = { ...m }; delete c[i]; return c; }) : rewriteEli5(i, s.content)}
                disabled={eli5Loading}
                className="mt-3 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 no-print"
              >
                <Sparkles className="h-3 w-3" /> {eli5Map[i] ? "Show original" : "Explain even simpler"}
              </button>
            </section>
          ))}
        </div>

        {article.when_to_call?.length > 0 && (
          <section className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              <AlertTriangle className="h-5 w-5 text-destructive" /> When to call your doctor
            </h2>
            <ul className="space-y-2 text-[16px] leading-[1.7]">
              {article.when_to_call.map((q, i) => <li key={i} className="flex gap-2"><span>•</span><span>{q}</span></li>)}
            </ul>
          </section>
        )}

        {article.questions_to_ask?.length > 0 && (
          <section className="mt-8 rounded-2xl bg-card border border-border p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              <MessageSquare className="h-5 w-5 text-primary" /> Questions to ask your doctor
            </h2>
            <ul className="space-y-2 text-[16px] leading-[1.7]">
              {article.questions_to_ask.map((q, i) => <li key={i} className="flex gap-2"><span className="text-primary font-semibold">{i + 1}.</span><span>{q}</span></li>)}
            </ul>
          </section>
        )}

        {article.sources?.length > 0 && (
          <section className="mt-8 border-t border-border pt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3"><BookOpen className="h-4 w-4" /> Sources</h2>
            <ul className="space-y-1.5 text-sm">
              {article.sources.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{s.name}</a></li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground">
          <p>Reviewed by {article.reviewer_name} — {article.reviewer_credentials}.</p>
          <p className="mt-2 italic">This is general health information, not medical advice. Talk to your doctor about your situation.</p>
        </footer>
      </article>
    </main>
  );
};

export default ArticlePage;