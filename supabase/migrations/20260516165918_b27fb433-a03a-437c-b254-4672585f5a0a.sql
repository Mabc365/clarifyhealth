CREATE TABLE public.problem_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  problem_type text NOT NULL,
  description text NOT NULL,
  reporter_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit problem reports" ON public.problem_reports FOR INSERT TO public WITH CHECK (true);
CREATE INDEX idx_problem_reports_slug ON public.problem_reports(article_slug);