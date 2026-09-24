
CREATE OR REPLACE FUNCTION public.is_allowed_email(_email text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(coalesce(_email,'')) LIKE '%@oralunic.com.br'
      OR lower(coalesce(_email,'')) LIKE '%@wescale.com.br'
      OR lower(coalesce(_email,'')) LIKE '%@lisolaser.com.br'
$$;

CREATE OR REPLACE FUNCTION public.current_user_allowed()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_allowed_email(coalesce(auth.jwt() ->> 'email',''))
$$;

DROP POLICY IF EXISTS "Admins manage brands" ON public.brands;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage strategies" ON public.strategies;
DROP POLICY IF EXISTS "Signed in can view brands" ON public.brands;
DROP POLICY IF EXISTS "Signed in can view categories" ON public.categories;
DROP POLICY IF EXISTS "Signed in can view strategies" ON public.strategies;

CREATE POLICY "Allowed team manages brands" ON public.brands
  FOR ALL TO authenticated
  USING (public.current_user_allowed())
  WITH CHECK (public.current_user_allowed());

CREATE POLICY "Allowed team manages categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.current_user_allowed())
  WITH CHECK (public.current_user_allowed());

CREATE POLICY "Allowed team manages strategies" ON public.strategies
  FOR ALL TO authenticated
  USING (public.current_user_allowed())
  WITH CHECK (public.current_user_allowed());

CREATE POLICY "Authenticated view brands" ON public.brands
  FOR SELECT TO authenticated
  USING (is_visible OR public.current_user_allowed());

CREATE POLICY "Authenticated view categories" ON public.categories
  FOR SELECT TO authenticated
  USING (is_visible OR public.current_user_allowed());

CREATE POLICY "Authenticated view strategies" ON public.strategies
  FOR SELECT TO authenticated
  USING (status = 'published' OR public.current_user_allowed());
