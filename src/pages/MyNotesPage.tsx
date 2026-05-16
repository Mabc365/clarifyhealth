import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarIcon, Loader2, Trash2, Search, MoreHorizontal, FileDown, Mail, Copy, Tag as TagIcon, X, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PageMeta from "@/components/PageMeta";
import MarkdownAnswer from "@/components/MarkdownAnswer";
import VisitRecorder from "@/components/notes/VisitRecorder";
import StructuredBreakdown, { Structured } from "@/components/notes/StructuredBreakdown";
import TranscriptView from "@/components/notes/TranscriptView";
import { exportVisitToPdf } from "@/lib/exportVisitPdf";

const SPECIALTIES = [
  "Primary Care", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Neurology", "Oncology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Pulmonology", "Rheumatology",
  "Urology", "OB/GYN", "Ophthalmology", "ENT", "Other",
];

interface TranscriptSeg { speaker?: string; text?: string; start?: number }
interface KeyTerm { term?: string; definition?: string }

interface VisitNote {
  id: string;
  doctor_name: string;
  visit_date: string;
  specialty: string | null;
  raw_notes: string | null;
  recording_url: string | null;
  ai_summary: string | null;
  ai_plain_english: string | null;
  ai_transcript: { transcript?: TranscriptSeg[]; key_terms?: KeyTerm[] } | null;
  ai_structured: Structured | null;
  ai_follow_up_questions: string[] | null;
  tags: string[];
  duration_seconds: number | null;
  processing_status: string | null;
  language: string | null;
  created_at: string;
}

const MyNotesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { toast } = useToast();

  const [notes, setNotes] = useState<VisitNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Form
  const [doctorName, setDoctorName] = useState("");
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [specialty, setSpecialty] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const pollRef = useRef<number | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Extract storage path from either a stored path or a legacy public URL
  const extractRecordingPath = (val: string | null): string | null => {
    if (!val) return null;
    const marker = "/recordings/";
    const idx = val.indexOf(marker);
    if (idx >= 0) return val.substring(idx + marker.length);
    return val;
  };

  const getSignedRecordingUrl = async (val: string | null): Promise<string | null> => {
    const path = extractRecordingPath(val);
    if (!path) return null;
    const { data } = await supabase.storage.from("recordings").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => { if (user) fetchNotes(); }, [user]);

  useEffect(() => {
    // Poll while anything is processing
    const anyProcessing = notes.some((n) => n.processing_status && n.processing_status !== "done" && n.processing_status !== "failed");
    if (anyProcessing && !pollRef.current) {
      pollRef.current = window.setInterval(fetchNotes, 4000);
    }
    if (!anyProcessing && pollRef.current) {
      window.clearInterval(pollRef.current); pollRef.current = null;
    }
    return () => {
      if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [notes]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("visit_notes").select("*")
      .order("visit_date", { ascending: false });
    const list = (data as unknown as VisitNote[]) || [];
    setNotes(list);
    // Generate signed URLs for any recordings we don't yet have a fresh URL for
    const next: Record<string, string> = { ...signedUrls };
    await Promise.all(
      list.map(async (n) => {
        if (n.recording_url && !next[n.id]) {
          const url = await getSignedRecordingUrl(n.recording_url);
          if (url) next[n.id] = url;
        }
      })
    );
    setSignedUrls(next);
    setLoadingNotes(false);
  };

  const allTags = useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (activeTag && !n.tags?.includes(activeTag)) return false;
      if (!q) return true;
      const hay = [
        n.doctor_name, n.specialty, n.raw_notes, n.ai_summary, n.ai_plain_english,
        ...(n.tags || []),
        ...(n.ai_transcript?.transcript || []).map((s) => s.text),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [notes, query, activeTag]);

  const resetForm = () => {
    setDoctorName(""); setVisitDate(new Date()); setSpecialty("");
    setRawNotes(""); setAudioFile(null); setAudioDuration(0);
  };

  const handleSubmit = async () => {
    if (!user || !doctorName.trim()) return;
    setSubmitting(true);

    let recordingUrl: string | null = null;
    let audioBase64: string | null = null;
    let audioMimeType: string | null = null;

    if (audioFile) {
      const ext = audioFile.name.split(".").pop() || "webm";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("recordings").upload(path, audioFile);
      if (!uploadError) {
        // Store the path; we generate short-lived signed URLs at read time
        recordingUrl = path;
      }
      try {
        const buf = await audioFile.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = ""; const CH = 8192;
        for (let i = 0; i < bytes.length; i += CH) {
          bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + CH, bytes.length))));
        }
        audioBase64 = btoa(bin);
        audioMimeType = audioFile.type || "audio/webm";
      } catch (err) { console.error("Audio read error:", err); }
    }

    const { data: inserted, error } = await supabase.from("visit_notes").insert({
      user_id: user.id,
      doctor_name: doctorName.trim(),
      visit_date: format(visitDate, "yyyy-MM-dd"),
      specialty: specialty || null,
      raw_notes: rawNotes || null,
      recording_url: recordingUrl,
      duration_seconds: audioDuration || null,
      processing_status: audioBase64 || rawNotes ? "transcribing" : null,
      language: lang,
    }).select().single();

    setSubmitting(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }

    setModalOpen(false); resetForm(); fetchNotes();

    if (inserted?.id) {
      if (audioBase64) processAudio(inserted.id, audioBase64, audioMimeType || "audio/webm");
      else if (rawNotes.trim()) processText(inserted.id, rawNotes.trim());
    }
  };

  const processAudio = async (id: string, audioBase64: string, mimeType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audioBase64, mimeType, language: lang },
      });
      if (error) throw error;
      const raw = data?.answer;
      let parsed: any = {};
      try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { parsed = { summary: String(raw || "") }; }
      await supabase.from("visit_notes").update({
        ai_summary: (parsed.summary || "").slice(0, 300),
        ai_plain_english: parsed.summary || null,
        ai_transcript: { transcript: parsed.transcript || [], key_terms: parsed.key_terms || [] },
        ai_structured: parsed.structured || null,
        ai_follow_up_questions: parsed.follow_up_questions || [],
        processing_status: "done",
      }).eq("id", id);
    } catch (err) {
      console.error("processAudio error:", err);
      await supabase.from("visit_notes").update({ processing_status: "failed" }).eq("id", id);
      toast({ title: "Transcription failed", description: "Please try again.", variant: "destructive" });
    }
    fetchNotes();
  };

  const processText = async (id: string, text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyze-visit", {
        body: { text, language: lang },
      });
      if (error) throw error;
      await supabase.from("visit_notes").update({
        ai_summary: (data?.summary || "").slice(0, 300),
        ai_plain_english: data?.summary || null,
        ai_structured: data?.structured || null,
        ai_follow_up_questions: data?.follow_up_questions || [],
        ai_transcript: data?.key_terms ? { transcript: [], key_terms: data.key_terms } : null,
        processing_status: "done",
      }).eq("id", id);
    } catch (err) {
      console.error("processText error:", err);
      await supabase.from("visit_notes").update({ processing_status: "failed" }).eq("id", id);
      toast({ title: "Analysis failed", description: "Please try again.", variant: "destructive" });
    }
    fetchNotes();
  };

  const reprocess = async (note: VisitNote) => {
    if (note.recording_url) {
      await supabase.from("visit_notes").update({ processing_status: "transcribing" }).eq("id", note.id);
      fetchNotes();
      try {
        const url = signedUrls[note.id] || (await getSignedRecordingUrl(note.recording_url));
        if (!url) throw new Error("No recording URL");
        const res = await fetch(url);
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = ""; const CH = 8192;
        for (let i = 0; i < bytes.length; i += CH) {
          bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + CH, bytes.length))));
        }
        const b64 = btoa(bin);
        const mime = blob.type || "audio/webm";
        processAudio(note.id, b64, mime);
      } catch (err) {
        console.error("reprocess audio fetch error:", err);
        await supabase.from("visit_notes").update({ processing_status: "failed" }).eq("id", note.id);
        toast({ title: "Could not load recording", variant: "destructive" });
        fetchNotes();
      }
      return;
    }
    await supabase.from("visit_notes").update({ processing_status: "analyzing" }).eq("id", note.id);
    fetchNotes();
    if (note.raw_notes) processText(note.id, note.raw_notes);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("visit_notes").delete().eq("id", id);
    fetchNotes();
  };

  const addTag = async (note: VisitNote, tag: string) => {
    const t = tag.trim(); if (!t) return;
    const next = Array.from(new Set([...(note.tags || []), t]));
    await supabase.from("visit_notes").update({ tags: next }).eq("id", note.id);
    fetchNotes();
  };
  const removeTag = async (note: VisitNote, tag: string) => {
    const next = (note.tags || []).filter((x) => x !== tag);
    await supabase.from("visit_notes").update({ tags: next }).eq("id", note.id);
    fetchNotes();
  };

  const buildHtml = (n: VisitNote) => {
    const s = n.ai_structured;
    const li = (arr?: string[]) => (arr?.length ? `<ul>${arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : "");
    return `
      <div style="font-family:system-ui,sans-serif;color:#222;line-height:1.5">
        <h2 style="font-family:Georgia,serif">${escapeHtml(n.doctor_name)} — ${n.visit_date}</h2>
        <p style="background:#fff8dc;border:1px solid #e6c98a;padding:8px;border-radius:6px;font-size:13px">Not clinician-approved. AI-generated summary for personal understanding only.</p>
        ${n.ai_summary ? `<h3>Summary</h3><p>${escapeHtml(n.ai_summary)}</p>` : ""}
        ${s?.diagnosis ? `<h3>Diagnosis</h3><p>${escapeHtml(s.diagnosis)}</p>` : ""}
        ${s?.medications?.length ? `<h3>Medications</h3><ul>${s.medications.map((m) => `<li><b>${escapeHtml(m.name || "")}</b> ${escapeHtml([m.dose, m.frequency].filter(Boolean).join(" · "))}${m.purpose ? ` — ${escapeHtml(m.purpose)}` : ""}</li>`).join("")}</ul>` : ""}
        ${s?.tests_ordered?.length ? `<h3>Tests ordered</h3>${li(s.tests_ordered)}` : ""}
        ${s?.follow_ups?.length ? `<h3>Follow-ups</h3><ul>${s.follow_ups.map((f) => `<li>${escapeHtml(f.what || "")}${f.when ? ` · ${escapeHtml(f.when)}` : ""}</li>`).join("")}</ul>` : ""}
        ${s?.red_flags?.length ? `<h3>Watch for</h3>${li(s.red_flags)}` : ""}
        ${n.ai_follow_up_questions?.length ? `<h3>Questions to ask next visit</h3>${li(n.ai_follow_up_questions)}` : ""}
      </div>`;
  };

  const emailMe = async (n: VisitNote) => {
    if (!user?.email) { toast({ title: "No email on file", variant: "destructive" }); return; }
    toast({ title: "Sending…" });
    const { error } = await supabase.functions.invoke("send-email", {
      body: { to: user.email, subject: `Visit summary — ${n.doctor_name} · ${n.visit_date}`, html: buildHtml(n) },
    });
    if (error) toast({ title: "Send failed", description: error.message, variant: "destructive" });
    else toast({ title: "Sent to your inbox" });
  };

  const copyToClipboard = async (n: VisitNote) => {
    const txt = stripHtml(buildHtml(n));
    await navigator.clipboard.writeText(txt);
    toast({ title: "Copied to clipboard" });
  };

  const exportPdf = (n: VisitNote, includeTranscript = false) => {
    exportVisitToPdf({
      doctor_name: n.doctor_name,
      visit_date: n.visit_date,
      specialty: n.specialty,
      ai_summary: n.ai_summary,
      ai_structured: n.ai_structured,
      ai_follow_up_questions: n.ai_follow_up_questions,
      key_terms: n.ai_transcript?.key_terms,
      transcript: n.ai_transcript?.transcript,
      includeTranscript,
    });
  };

  if (authLoading) {
    return <main className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></main>;
  }

  return (
    <>
      <PageMeta title="My Doctor Visits | Clarify Health" description="Keep track of your doctor visits and get AI-powered summaries." canonical="/my-notes" />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="mx-auto max-w-[840px]">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h1 className="text-[36px] md:text-[44px] font-medium" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}>
              {t("notes.title")}
            </h1>
            <Dialog open={modalOpen} onOpenChange={(o) => { setModalOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />{t("notes.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>{t("notes.addVisit")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-[13px]">{t("notes.doctorName")}</Label>
                    <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Smith" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-[13px]">{t("notes.date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !visitDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {visitDate ? format(visitDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={visitDate} onSelect={(d) => d && setVisitDate(d)} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-[13px]">{t("notes.specialty")}</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[13px]">{t("notes.notesLabel")}</Label>
                    <Textarea value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} placeholder={t("notes.notesPlaceholder")} className="mt-1 min-h-[100px]" />
                  </div>
                  <div>
                    <Label className="text-[13px] mb-1.5 block">{t("notes.recording")}</Label>
                    <VisitRecorder
                      existingFile={audioFile}
                      onReady={(f, sec) => { setAudioFile(f); if (sec) setAudioDuration(sec); }}
                      onClear={() => { setAudioFile(null); setAudioDuration(0); }}
                    />
                  </div>
                  <Button onClick={handleSubmit} disabled={submitting || !doctorName.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("notes.save")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search + tag filter */}
          {!loadingNotes && notes.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search visits, transcripts, tags…" className="pl-9" />
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setActiveTag(null)} className={cn("text-[12px] px-2.5 py-1 rounded-full border", !activeTag ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:bg-muted")}>All</button>
                  {allTags.map((tg) => (
                    <button key={tg} onClick={() => setActiveTag(tg === activeTag ? null : tg)} className={cn("text-[12px] px-2.5 py-1 rounded-full border", activeTag === tg ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:bg-muted")}>
                      {tg}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loadingNotes ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-[15px] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t("notes.empty")}</p>
              <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><Plus className="h-4 w-4" />{t("notes.add")}</Button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-[14px]">No visits match.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  recordingSignedUrl={signedUrls[note.id]}
                  expanded={expandedId === note.id}
                  onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
                  onDelete={() => handleDelete(note.id)}
                  onAddTag={(t) => addTag(note, t)}
                  onRemoveTag={(t) => removeTag(note, t)}
                  onReprocess={() => reprocess(note)}
                  onEmail={() => emailMe(note)}
                  onCopy={() => copyToClipboard(note)}
                  onExportPdf={(t) => exportPdf(note, t)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

function NoteCard({
  note, recordingSignedUrl, expanded, onToggle, onDelete, onAddTag, onRemoveTag, onReprocess, onEmail, onCopy, onExportPdf,
}: {
  note: VisitNote; recordingSignedUrl?: string; expanded: boolean; onToggle: () => void; onDelete: () => void;
  onAddTag: (t: string) => void; onRemoveTag: (t: string) => void;
  onReprocess: () => void; onEmail: () => void; onCopy: () => void;
  onExportPdf: (includeTranscript: boolean) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const processing = note.processing_status && note.processing_status !== "done" && note.processing_status !== "failed";

  return (
    <div className="rounded-md p-5 transition-colors" style={{ border: "0.5px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
      <div className="flex items-start justify-between gap-3">
        <button className="text-left flex-1" onClick={onToggle}>
          <h3 className="text-[16px] font-medium text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{note.doctor_name}</h3>
          <div className="flex items-center gap-3 mt-1 text-[13px] text-muted-foreground flex-wrap">
            <span>{format(new Date(note.visit_date), "MMM d, yyyy")}</span>
            {note.specialty && <><span>·</span><span>{note.specialty}</span></>}
            {note.duration_seconds ? <><span>·</span><span>{Math.round(note.duration_seconds / 60)} min recording</span></> : null}
            {processing && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                {note.processing_status === "transcribing" ? "Transcribing…" : "Analyzing…"}
              </span>
            )}
            {note.processing_status === "failed" && <span className="text-destructive">Processing failed</span>}
          </div>
          {note.ai_summary && !expanded && <p className="mt-2 text-[13px] text-muted-foreground line-clamp-2">{note.ai_summary}</p>}
          {!!note.tags?.length && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map((tg) => (
                <span key={tg} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tg}</span>
              ))}
            </div>
          )}
        </button>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="More">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExportPdf(false)} className="gap-2"><FileDown className="h-4 w-4" />Export PDF</DropdownMenuItem>
              {note.ai_transcript?.transcript?.length ? (
                <DropdownMenuItem onClick={() => onExportPdf(true)} className="gap-2"><FileDown className="h-4 w-4" />Export PDF with transcript</DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={onEmail} className="gap-2"><Mail className="h-4 w-4" />Email to me</DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy} className="gap-2"><Copy className="h-4 w-4" />Copy summary</DropdownMenuItem>
              {(note.recording_url || note.raw_notes) && !processing && (
                <DropdownMenuItem onClick={onReprocess} className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {note.recording_url ? "Transcribe & analyze recording" : "Re-analyze"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <span className="text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full bg-amber-100 text-amber-900 font-medium">Not clinician-approved</span>
            {note.recording_url && recordingSignedUrl && <audio controls src={recordingSignedUrl} className="h-9 max-w-full" />}
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript" disabled={!note.ai_transcript?.transcript?.length}>Transcript</TabsTrigger>
              <TabsTrigger value="questions" disabled={!note.ai_follow_up_questions?.length}>Questions</TabsTrigger>
              <TabsTrigger value="glossary" disabled={!note.ai_transcript?.key_terms?.length}>Glossary</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4 space-y-4">
              {note.raw_notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-1">Your notes</p>
                  <p className="text-[14px] whitespace-pre-wrap">{note.raw_notes}</p>
                </div>
              )}
              {note.ai_plain_english && (
                <div className="p-4 rounded-md" style={{ background: "hsl(var(--section-bg))" }}>
                  <p className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-1.5">Plain-English summary</p>
                  <MarkdownAnswer text={note.ai_plain_english} />
                </div>
              )}
              <StructuredBreakdown data={note.ai_structured} />
              {processing && !note.ai_plain_english && (
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />Working on it…
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="mt-4">
              <TranscriptView transcript={note.ai_transcript?.transcript} keyTerms={note.ai_transcript?.key_terms} />
            </TabsContent>

            <TabsContent value="questions" className="mt-4">
              <p className="text-[12px] text-muted-foreground mb-2">Personalized questions to ask at your next visit.</p>
              <ol className="list-decimal pl-5 space-y-2 text-[14px]">
                {(note.ai_follow_up_questions || []).map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </TabsContent>

            <TabsContent value="glossary" className="mt-4">
              <ul className="space-y-3">
                {(note.ai_transcript?.key_terms || []).map((k, i) => (
                  <li key={i}>
                    <div className="text-[14px] font-medium">{k.term}</div>
                    <div className="text-[13px] text-muted-foreground">{k.definition}</div>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>

          {/* Tag editor */}
          <div className="mt-5 pt-4" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-2"><TagIcon className="h-3 w-3" />Tags</div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {(note.tags || []).map((tg) => (
                <span key={tg} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-muted">
                  {tg}
                  <button onClick={() => onRemoveTag(tg)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); onAddTag(tagInput); setTagInput(""); }
                }}
                placeholder="Add tag…"
                className="text-[12px] px-2 py-1 rounded-full border border-input bg-background w-28 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim(); }

export default MyNotesPage;