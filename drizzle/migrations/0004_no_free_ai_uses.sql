CREATE OR REPLACE FUNCTION public.consume_ai_use(_user_id uuid, _feature text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _tier text; _limit int; _used int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(_user_id::text));
  SELECT tier INTO _tier FROM subscriptions WHERE user_id = _user_id AND status = 'active';
  _limit := CASE _tier WHEN 'tier2' THEN 50 WHEN 'tier1' THEN 25 ELSE 0 END;
  SELECT count(*) INTO _used FROM ai_usage WHERE user_id = _user_id AND created_at >= date_trunc('month', now());
  IF _used >= _limit THEN
    RETURN jsonb_build_object('allowed', false, 'used', _used, 'limit', _limit, 'tier', COALESCE(_tier,'free'));
  END IF;
  INSERT INTO ai_usage(user_id, feature) VALUES (_user_id, _feature);
  RETURN jsonb_build_object('allowed', true, 'used', _used + 1, 'limit', _limit, 'tier', COALESCE(_tier,'free'));
END; $function$;