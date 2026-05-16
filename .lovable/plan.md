# Advanced Doctor Visit Notes

A major upgrade to `/my-notes` covering live recording, better transcripts, structured AI breakdown, search & tags, and PDF/email export.

## 1. Live in-browser recording
- New `<VisitRecorder />` using `MediaRecorder` (webm/opus).
- Mic permission prompt, big record button, pause/resume, live timer, animated waveform (Web Audio AnalyserNode).
- Cap at **60 min** with a warning at 55 min.
- On stop: shows playback + "Save & transcribe" or "Discard".
- Drag-and-drop / file upload remains as a fallback in the same modal.

## 2. High-quality transcription with speaker labels (ElevenLabs Scribe)
- Replace the Gemini audio path with **ElevenLabs `scribe_v2`** (`diarize=true`, `tag_audio_events=true`).
- New edge function `transcribe-visit` uploads the audio file directly to ElevenLabs (multipart), returns:
  - Full text
  - Word-level timestamps
  - Speaker-labeled segments (speaker_0 / speaker_1 → relabeled "Doctor" / "Patient" by simple heuristic: longer-speaking party = Doctor, or user picks)
- Stored as `ai_transcript` JSON on `visit_notes`.

Requires new secret: **`ELEVENLABS_API_KEY`** (I'll ask you for it before deploying).

## 3. Structured AI breakdown
- After transcription, a second function `analyze-visit` calls Lovable AI Gateway (`google/gemini-2.5-flash`) with the transcript and returns strict JSON:
  ```
  diagnosis, medications[{name, dose, frequency, purpose}],
  tests_ordered[], follow_ups[{what, when}],
  red_flags[], plain_english_summary, key_terms[{term, definition}]
  ```
- Rendered in the expanded card as labeled sections (Diagnosis, Medications table, Tests, Follow-ups, Red flags).
- All sections keep the "Not clinician-approved" amber badge.

## 4. Smart follow-up questions + inline jargon glossary
- `analyze-visit` also returns `follow_up_questions[]` personalized to what was discussed.
- `key_terms` are rendered inline: any medical word in the transcript that matches a term shows a dotted underline + popover with the plain-English definition.

## 5. Search, tags, PDF/email export
- Search box at top of `/my-notes` (client-side ILIKE across doctor name, specialty, transcript, summary).
- Tag chips on each note (free-text, stored as `text[]`), editable in the card. Filter pill row above the list.
- Per-note menu:
  - **Export PDF** — client-side via `jspdf` (already common; small bundle) producing a clean summary sheet (visit info + structured breakdown + follow-up questions). No transcript by default; toggle to include.
  - **Email me** — invokes existing Resend `send-email` function with the rendered HTML.
  - **Copy to clipboard**.

## 6. Schema changes (one migration)
Add to `visit_notes`:
- `ai_transcript jsonb` (segments + timestamps)
- `ai_structured jsonb` (diagnosis/meds/tests/follow_ups/red_flags/key_terms)
- `ai_follow_up_questions jsonb`
- `tags text[] default '{}'`
- `duration_seconds int`

Allow `UPDATE` policy on `tags` (already covered by existing "Users can update their own notes").

## 7. Edge functions
- New: `transcribe-visit` (ElevenLabs Scribe, multipart upload, returns transcript JSON).
- New: `analyze-visit` (Lovable AI → structured JSON).
- Keep existing `transcribe-audio` as legacy fallback if ElevenLabs key is missing.

## 8. UI / UX
- Expanded card becomes a tabbed view: **Summary · Transcript · Questions · Glossary**.
- Recording modal redesigned with clear states: idle → recording → review → uploading → analyzing.
- Progress chip on the note ("Transcribing…", "Analyzing…") with polling on `visit_notes`.

## Technical notes
- `MediaRecorder` produces `audio/webm;codecs=opus` — supported by Scribe.
- For files > ~6 MB, upload to the existing `recordings` bucket first, then pass the signed URL to `transcribe-visit` (avoids base64 round-trip).
- `jspdf` + `jspdf-autotable` for export (≈80 KB gzipped, lazy-loaded).
- All new secrets prompted via the secrets tool before deploying functions.

## Files I'll touch
- `supabase/migrations/<new>.sql`
- `supabase/functions/transcribe-visit/index.ts` (new)
- `supabase/functions/analyze-visit/index.ts` (new)
- `src/pages/MyNotesPage.tsx`
- `src/components/notes/VisitRecorder.tsx` (new)
- `src/components/notes/StructuredBreakdown.tsx` (new)
- `src/components/notes/TranscriptView.tsx` (new)
- `src/components/notes/GlossaryPopover.tsx` (new)
- `src/lib/exportVisitPdf.ts` (new)
