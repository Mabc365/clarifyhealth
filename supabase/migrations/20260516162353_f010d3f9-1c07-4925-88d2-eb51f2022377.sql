-- Articles table for the plain-English topic library
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  tldr JSONB NOT NULL DEFAULT '[]'::jsonb,
  body_system TEXT NOT NULL,
  life_stage TEXT NOT NULL DEFAULT 'all',
  conditions TEXT[] NOT NULL DEFAULT '{}',
  reading_grade INTEGER NOT NULL DEFAULT 6,
  read_time_min INTEGER NOT NULL DEFAULT 5,
  last_reviewed DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewer_name TEXT NOT NULL DEFAULT 'Clarify Health Editorial Team',
  reviewer_credentials TEXT NOT NULL DEFAULT 'Reviewed for plain-language accuracy',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
  when_to_call JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_to_ask JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, language)
);

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_body_system ON public.articles(body_system);
CREATE INDEX idx_articles_life_stage ON public.articles(life_stage);
CREATE INDEX idx_articles_conditions ON public.articles USING GIN(conditions);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable"
ON public.articles
FOR SELECT
USING (true);

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Glossary terms
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  pronunciation TEXT,
  plain_definition TEXT NOT NULL,
  see_also TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(term, language)
);

CREATE INDEX idx_glossary_term_lower ON public.glossary_terms (lower(term));
CREATE INDEX idx_glossary_first_letter ON public.glossary_terms (lower(left(term, 1)));

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glossary is publicly readable"
ON public.glossary_terms
FOR SELECT
USING (true);