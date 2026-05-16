import jsPDF from "jspdf";

interface Med { name?: string; dose?: string; frequency?: string; purpose?: string }
interface FollowUp { what?: string; when?: string }
interface KeyTerm { term?: string; definition?: string }
interface TranscriptSeg { speaker?: string; text?: string; start?: number }

export interface VisitExportData {
  doctor_name: string;
  visit_date: string;
  specialty?: string | null;
  raw_notes?: string | null;
  ai_summary?: string | null;
  ai_structured?: {
    diagnosis?: string;
    medications?: Med[];
    tests_ordered?: string[];
    follow_ups?: FollowUp[];
    red_flags?: string[];
  } | null;
  ai_follow_up_questions?: string[] | null;
  key_terms?: KeyTerm[] | null;
  transcript?: TranscriptSeg[] | null;
  includeTranscript?: boolean;
}

export function exportVisitToPdf(v: VisitExportData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (need: number) => {
    if (y + need > pageH - margin) { doc.addPage(); y = margin; }
  };

  const h = (text: string, size = 16) => {
    ensure(size + 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(size);
    doc.text(text, margin, y); y += size + 8;
  };
  const p = (text: string, size = 11) => {
    if (!text) return;
    doc.setFont("helvetica", "normal"); doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach((ln: string) => { ensure(size + 4); doc.text(ln, margin, y); y += size + 4; });
    y += 4;
  };
  const bullet = (items: string[], size = 11) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size);
    items.filter(Boolean).forEach((it) => {
      const lines = doc.splitTextToSize("• " + it, maxW);
      lines.forEach((ln: string, i: number) => {
        ensure(size + 4);
        doc.text(i === 0 ? ln : "  " + ln.replace(/^•\s*/, ""), margin, y);
        y += size + 4;
      });
    });
    y += 4;
  };

  // Header
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("Doctor visit summary", margin, y); y += 26;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.text(`${v.doctor_name}${v.specialty ? " · " + v.specialty : ""}`, margin, y); y += 14;
  doc.text(v.visit_date, margin, y); y += 20;

  // Amber disclaimer
  doc.setDrawColor(200, 150, 0); doc.setFillColor(255, 248, 220);
  ensure(40); doc.roundedRect(margin, y, maxW, 30, 4, 4, "FD");
  doc.setFontSize(9); doc.setTextColor(120, 80, 0);
  doc.text("Not clinician-approved. AI-generated summary for personal understanding only.", margin + 10, y + 19);
  doc.setTextColor(0, 0, 0); y += 46;

  if (v.ai_summary) { h("Summary"); p(v.ai_summary); }

  const s = v.ai_structured;
  if (s?.diagnosis) { h("Diagnosis", 13); p(s.diagnosis); }

  if (s?.medications?.length) {
    h("Medications", 13);
    bullet(s.medications.map(m => [m.name, m.dose, m.frequency].filter(Boolean).join(" · ") + (m.purpose ? ` — ${m.purpose}` : "")).filter(Boolean));
  }

  if (s?.tests_ordered?.length) { h("Tests ordered", 13); bullet(s.tests_ordered); }

  if (s?.follow_ups?.length) {
    h("Follow-ups", 13);
    bullet(s.follow_ups.map(f => [f.what, f.when ? `(${f.when})` : ""].filter(Boolean).join(" ")));
  }

  if (s?.red_flags?.length) { h("Watch for", 13); bullet(s.red_flags); }

  if (v.ai_follow_up_questions?.length) {
    h("Questions to ask next visit", 13);
    bullet(v.ai_follow_up_questions);
  }

  if (v.key_terms?.length) {
    h("Plain-English glossary", 13);
    bullet(v.key_terms.map(k => `${k.term}: ${k.definition}`));
  }

  if (v.includeTranscript && v.transcript?.length) {
    doc.addPage(); y = margin;
    h("Transcript");
    v.transcript.forEach(seg => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      ensure(14); doc.text((seg.speaker || "Speaker") + ":", margin, y); y += 12;
      p(seg.text || "", 10);
    });
  }

  const file = `visit-${v.doctor_name.replace(/\s+/g, "-").toLowerCase()}-${v.visit_date}.pdf`;
  doc.save(file);
}