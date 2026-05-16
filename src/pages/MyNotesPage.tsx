import { useState, useEffect } from "react";
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
import { Plus, CalendarIcon, Upload, FileAudio, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PageMeta from "@/components/PageMeta";
import MarkdownAnswer from "@/components/MarkdownAnswer";

const SPECIALTIES = [
  "Primary Care", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Neurology", "Oncology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Pulmonology", "Rheumatology",
  "Urology", "OB/GYN", "Ophthalmology", "ENT", "Other",
];

interface VisitNote {
  id: string;
  doctor_name: string;
  visit_date: string;
  specialty: string | null;
  raw_notes: string | null;
  recording_url: string | null;
  ai_summary: string | null;
  ai_questions: string[] | null;
  ai_holistic: string | null;
  ai_plain_english: string | null;
  language: string | null;
  created_at: string;
}

const MyNotesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [notes, setNotes] = useState<VisitNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [doctorName, setDoctorName] = useState("");
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [specialty, setSpecialty] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    const { data } = await supabase
      .from("visit_notes")
      .select("*")
      .order("visit_date", { ascending: false });
    setNotes((data as VisitNote[]) || []);
    setLoadingNotes(false);
  };

  const resetForm = () => {
    setDoctorName("");
    setVisitDate(new Date());
    setSpecialty("");
    setRawNotes("");
    setAudioFile(null);
  };

  const handleSubmit = async () => {
    if (!user || !doctorName.trim()) return;
    setSubmitting(true);

    let recordingUrl: string | null = null;
    let audioBase64: string | null = null;
    let audioMimeType: string | null = null;
    if (audioFile) {
      const ext = audioFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(path, audioFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(path);
        recordingUrl = urlData.publicUrl;
      }
      // Read audio for transcription
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const CHUNK = 8192;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode.apply(
            null,
            Array.from(bytes.subarray(i, Math.min(i + CHUNK, bytes.length)))
          );
        }
        audioBase64 = btoa(binary);
        audioMimeType = audioFile.type || "audio/mpeg";
      } catch (err) {
        console.error("Audio read error:", err);
      }
    }

    const { data: inserted, error } = await supabase.from("visit_notes").insert({
      user_id: user.id,
      doctor_name: doctorName.trim(),
      visit_date: format(visitDate, "yyyy-MM-dd"),
      specialty: specialty || null,
      raw_notes: rawNotes || null,
      recording_url: recordingUrl,
      language: lang,
    }).select().single();

    setSubmitting(false);
    if (!error) {
      setModalOpen(false);
      resetForm();
      fetchNotes();

      // Kick off transcription in background if we have audio
      if (audioBase64 && inserted?.id) {
        transcribeInBackground(inserted.id, audioBase64, audioMimeType || "audio/mpeg");
      }
    }
  };

  const transcribeInBackground = async (
    noteId: string,
    audioBase64: string,
    mimeType: string
  ) => {
    setProcessing(noteId);
    try {
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audioBase64, mimeType, language: lang },
      });
      if (!error && data?.answer) {
        await supabase
          .from("visit_notes")
          .update({
            ai_summary: data.answer.slice(0, 300),
            ai_plain_english: data.answer,
          })
          .eq("id", noteId);
        fetchNotes();
      }
    } catch (err) {
      console.error("Transcription error:", err);
    }
    setProcessing(null);
  };

  const handleProcess = async (note: VisitNote) => {
    if (!note.raw_notes) return;
    setProcessing(note.id);

    try {
      const { data, error } = await supabase.functions.invoke("ask", {
        body: {
          question: note.raw_notes,
          mode: "diagnosis",
          language: note.language || lang,
        },
      });

      if (!error && data?.answer) {
        await supabase
          .from("visit_notes")
          .update({
            ai_summary: data.answer.slice(0, 300),
            ai_plain_english: data.answer,
          })
          .eq("id", note.id);
        fetchNotes();
      }
    } catch (err) {
      console.error("Processing error:", err);
    }
    setProcessing(null);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("visit_notes").delete().eq("id", id);
    fetchNotes();
  };

  if (authLoading) {
    return <main className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></main>;
  }

  return (
    <>
      <PageMeta title="My Doctor Visits | Clarify Health" description="Keep track of your doctor visits and get AI-powered summaries." canonical="/my-notes" />
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="mx-auto max-w-[800px]">
          <div className="flex items-center justify-between mb-10">
            <h1
              className="text-[36px] md:text-[44px] font-medium"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}
            >
              {t("notes.title")}
            </h1>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  {t("notes.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t("notes.addVisit")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-[13px]">{t("notes.doctorName")}</Label>
                    <Input
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Dr. Smith"
                      className="mt-1"
                    />
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
                        <Calendar
                          mode="single"
                          selected={visitDate}
                          onSelect={(d) => d && setVisitDate(d)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-[13px]">{t("notes.specialty")}</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[13px]">{t("notes.notesLabel")}</Label>
                    <Textarea
                      value={rawNotes}
                      onChange={(e) => setRawNotes(e.target.value)}
                      placeholder={t("notes.notesPlaceholder")}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="text-[13px]">{t("notes.recording")}</Label>
                    <label className="mt-1 flex items-center gap-3 cursor-pointer rounded-md border border-input bg-background px-3 py-3 text-[13px] text-muted-foreground hover:bg-muted transition-colors">
                      {audioFile ? (
                        <>
                          <FileAudio className="h-4 w-4 text-primary" />
                          <span className="text-foreground truncate">{audioFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>{t("notes.uploadAudio")}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".mp3,.m4a,.wav,.webm"
                        className="hidden"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !doctorName.trim()}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("notes.save")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingNotes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-[15px] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t("notes.empty")}
              </p>
              <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                {t("notes.add")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md p-5 transition-colors"
                  style={{ border: "0.5px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                >
                  <div className="flex items-start justify-between">
                    <button
                      className="text-left flex-1"
                      onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                    >
                      <h3 className="text-[16px] font-medium text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {note.doctor_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[13px] text-muted-foreground">
                        <span>{format(new Date(note.visit_date), "MMM d, yyyy")}</span>
                        {note.specialty && (
                          <>
                            <span>·</span>
                            <span>{note.specialty}</span>
                          </>
                        )}
                      </div>
                      {note.ai_summary && (
                        <p className="mt-2 text-[13px] text-muted-foreground line-clamp-1">
                          {note.ai_summary}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {expandedId === note.id && (
                    <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
                      {note.raw_notes && (
                        <div className="mb-4">
                          <p className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {t("notes.yourNotes")}
                          </p>
                          <p className="text-[14px] text-foreground whitespace-pre-wrap">{note.raw_notes}</p>
                        </div>
                      )}

                      {note.recording_url && (
                        <div className="mb-4">
                          <p className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-1">Recording</p>
                          <audio controls src={note.recording_url} className="w-full h-10" />
                        </div>
                      )}

                      {note.ai_plain_english && (
                        <div className="mb-4 p-4 rounded-md" style={{ background: "hsl(var(--section-bg))" }}>
                          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                            <p className="text-[11px] uppercase tracking-[1.2px] text-muted-foreground">AI transcript & plain-English summary</p>
                            <span className="text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full bg-amber-100 text-amber-900 font-medium">
                              Not clinician-approved
                            </span>
                          </div>
                          <MarkdownAnswer text={note.ai_plain_english} />
                          <p className="mt-3 text-[12px] text-muted-foreground italic">
                            This summary was generated by AI and has not been reviewed by a clinician. Always confirm details with your doctor.
                          </p>
                        </div>
                      )}

                      {processing === note.id && !note.ai_plain_english && (
                        <div className="mb-4 flex items-center gap-2 text-[13px] text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Transcribing and summarizing recording…
                        </div>
                      )}

                      {note.raw_notes && !note.ai_plain_english && (
                        <Button
                          onClick={() => handleProcess(note)}
                          disabled={processing === note.id}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                          size="sm"
                        >
                          {processing === note.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          {t("notes.process")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MyNotesPage;
