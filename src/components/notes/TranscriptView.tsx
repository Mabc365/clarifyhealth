import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Seg { speaker?: string; text?: string; start?: number }
interface KeyTerm { term?: string; definition?: string }

export default function TranscriptView({
  transcript, keyTerms,
}: { transcript: Seg[] | null | undefined; keyTerms?: KeyTerm[] | null }) {
  if (!transcript?.length) {
    return <p className="text-[13px] text-muted-foreground">No transcript available yet.</p>;
  }
  const terms = (keyTerms || []).filter((k) => k.term && k.definition);

  return (
    <div className="space-y-3">
      {transcript.map((seg, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-20 shrink-0">
            <div className="text-[11px] uppercase tracking-[1px] font-medium text-primary">{seg.speaker || "Speaker"}</div>
            {typeof seg.start === "number" && (
              <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(seg.start)}</div>
            )}
          </div>
          <p className="text-[14px] leading-relaxed flex-1">{highlight(seg.text || "", terms)}</p>
        </div>
      ))}
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60); const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

function highlight(text: string, terms: KeyTerm[]) {
  if (!terms.length) return text;
  const sorted = [...terms].sort((a, b) => (b.term?.length || 0) - (a.term?.length || 0));
  const pattern = new RegExp(
    `\\b(${sorted.map((t) => escapeRe(t.term!)).join("|")})\\b`,
    "gi"
  );
  const parts: (string | { match: string; def: string })[] = [];
  let last = 0;
  text.replace(pattern, (m, _g, off) => {
    if (off > last) parts.push(text.slice(last, off));
    const def = sorted.find((t) => t.term?.toLowerCase() === m.toLowerCase())?.definition || "";
    parts.push({ match: m, def });
    last = off + m.length;
    return m;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <Popover key={i}>
        <PopoverTrigger asChild>
          <button className="underline decoration-dotted decoration-primary/60 underline-offset-2 hover:bg-primary/5 rounded-sm">
            {p.match}
          </button>
        </PopoverTrigger>
        <PopoverContent className="text-[13px] max-w-xs">
          <div className="font-medium mb-1">{p.match}</div>
          <div className="text-muted-foreground">{p.def}</div>
        </PopoverContent>
      </Popover>
    )
  );
}

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }