
-- Restrict profiles visibility to the owning user
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Make recordings bucket private and remove broad public read policy
UPDATE storage.buckets SET public = false WHERE id = 'recordings';
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;

-- Explicit deny for SELECT on doctor_search_queries (no read access for anon/authenticated)
CREATE POLICY "No read access to search queries"
  ON public.doctor_search_queries FOR SELECT
  USING (false);

-- Harden search_path on existing SECURITY DEFINER helpers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
