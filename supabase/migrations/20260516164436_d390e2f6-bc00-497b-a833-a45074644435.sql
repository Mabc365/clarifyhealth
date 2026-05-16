
-- Newsletter subscribers (double opt-in)
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed')),
  confirmation_token text NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'en',
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- No public access; edge functions use service role
CREATE POLICY "Service role manages subscribers"
ON public.newsletter_subscribers FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Article feedback (anonymous, append-only)
CREATE TABLE public.article_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('yes','somewhat','no')),
  comment text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.article_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback; no one can read (privacy)
CREATE POLICY "Anyone can submit feedback"
ON public.article_feedback FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_article_feedback_slug ON public.article_feedback(article_slug);
