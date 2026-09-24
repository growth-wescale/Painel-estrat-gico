
CREATE TABLE public.panel_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin','editor','leitor')),
  brand_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.panel_access TO authenticated;
GRANT ALL ON public.panel_access TO service_role;

ALTER TABLE public.panel_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read panel_access"
  ON public.panel_access FOR SELECT TO authenticated USING (true);

CREATE POLICY "Growth manages panel_access"
  ON public.panel_access FOR ALL TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email','')) = 'growth@wescale.com.br')
  WITH CHECK (lower(coalesce(auth.jwt() ->> 'email','')) = 'growth@wescale.com.br');

CREATE TRIGGER trg_panel_access_updated_at
  BEFORE UPDATE ON public.panel_access
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Migra pauta_access existentes como admin
INSERT INTO public.panel_access (email, role)
SELECT lower(email), 'admin' FROM public.pauta_access
ON CONFLICT (email) DO NOTHING;
