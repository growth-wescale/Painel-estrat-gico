DROP POLICY IF EXISTS "Authenticated read panel_access" ON public.panel_access;
CREATE POLICY "Read own or growth panel_access"
  ON public.panel_access FOR SELECT TO authenticated
  USING (
    lower(coalesce((auth.jwt() ->> 'email'),'')) = 'growth@wescale.com.br'
    OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'),''))
  );

DROP POLICY IF EXISTS "Authenticated can read pauta access" ON public.pauta_access;
CREATE POLICY "Read own or growth pauta_access"
  ON public.pauta_access FOR SELECT TO authenticated
  USING (
    lower(coalesce((auth.jwt() ->> 'email'),'')) = 'growth@wescale.com.br'
    OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'),''))
  );