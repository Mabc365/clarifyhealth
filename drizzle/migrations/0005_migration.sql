DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.article_feedback;
CREATE POLICY "Anyone can submit valid feedback" ON public.article_feedback FOR INSERT TO anon, authenticated
WITH CHECK (
  rating IN ('yes','somewhat','no')
  AND char_length(article_slug) BETWEEN 1 AND 200
  AND char_length(language) BETWEEN 2 AND 10
  AND (comment IS NULL OR char_length(comment) <= 2000)
);

DROP POLICY IF EXISTS "Anyone can insert search queries" ON public.doctor_search_queries;

DROP POLICY IF EXISTS "Anyone can submit problem reports" ON public.problem_reports;