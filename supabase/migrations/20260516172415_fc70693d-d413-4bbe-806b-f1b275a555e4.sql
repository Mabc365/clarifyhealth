
ALTER TABLE public.visit_notes
  ADD COLUMN IF NOT EXISTS ai_transcript jsonb,
  ADD COLUMN IF NOT EXISTS ai_structured jsonb,
  ADD COLUMN IF NOT EXISTS ai_follow_up_questions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS processing_status text;
