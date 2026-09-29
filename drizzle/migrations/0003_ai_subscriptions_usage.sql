CREATE TABLE public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text,
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  whop_membership_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ai_usage (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_user_time ON public.ai_usage(user_id, created_at);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
GRANT USAGE ON SEQUENCE public.ai_usage_id_seq TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_ai_use(_user_id uuid, _feature text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tier text; _limit int; _used int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(_user_id::text));
  SELECT tier INTO _tier FROM subscriptions WHERE user_id = _user_id AND status = 'active';
  _limit := CASE _tier WHEN 'tier2' THEN 50 WHEN 'tier1' THEN 25 ELSE 3 END;
  SELECT count(*) INTO _used FROM ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now());
  IF _used >= _limit THEN
    RETURN jsonb_build_object('allowed', false, 'used', _used, 'limit', _limit, 'tier', COALESCE(_tier,'free'));
  END IF;
  INSERT INTO ai_usage(user_id, feature) VALUES (_user_id, _feature);
  RETURN jsonb_build_object('allowed', true, 'used', _used + 1, 'limit', _limit, 'tier', COALESCE(_tier,'free'));
END; $$;
REVOKE EXECUTE ON FUNCTION public.consume_ai_use(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_use(uuid, text) TO service_role;