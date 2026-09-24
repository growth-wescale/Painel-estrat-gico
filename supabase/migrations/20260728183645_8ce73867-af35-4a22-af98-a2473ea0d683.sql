CREATE TABLE public.custom_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_slug text NOT NULL,
  grupo text NOT NULL DEFAULT 'participamos',
  nome text NOT NULL,
  formato text NOT NULL DEFAULT '',
  periodicidade text NOT NULL DEFAULT '',
  publico text NOT NULL DEFAULT '',
  custo text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  data_evento text NOT NULL DEFAULT '',
  oferta text NOT NULL DEFAULT '',
  notas text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_events_grupo_chk CHECK (grupo IN ('fazemos','participamos','insights'))
);

GRANT SELECT ON public.custom_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_events TO authenticated;
GRANT ALL ON public.custom_events TO service_role;

ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read custom_events"
  ON public.custom_events FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated read custom_events"
  ON public.custom_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allowed team manages custom_events"
  ON public.custom_events FOR ALL TO authenticated
  USING (public.current_user_allowed())
  WITH CHECK (public.current_user_allowed());

CREATE TRIGGER custom_events_set_updated_at
  BEFORE UPDATE ON public.custom_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX custom_events_brand_idx ON public.custom_events(brand_slug, position);