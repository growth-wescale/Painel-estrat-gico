
CREATE OR REPLACE FUNCTION public.is_allowed_email(_email text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT lower(coalesce(_email,'')) LIKE '%@oralunic.com.br'
      OR lower(coalesce(_email,'')) LIKE '%@wescale.com.br'
      OR lower(coalesce(_email,'')) LIKE '%@lisolaser.com.br'
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_allowed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
