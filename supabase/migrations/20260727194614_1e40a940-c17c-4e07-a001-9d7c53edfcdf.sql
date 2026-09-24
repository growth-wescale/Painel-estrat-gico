
CREATE TABLE public.pauta_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pauta_access TO authenticated;
GRANT ALL ON public.pauta_access TO service_role;

ALTER TABLE public.pauta_access ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler (para o painel checar se o próprio e-mail está liberado)
CREATE POLICY "Authenticated can read pauta access"
  ON public.pauta_access FOR SELECT
  TO authenticated
  USING (true);

-- Somente growth@wescale.com.br pode gerenciar
CREATE POLICY "Only growth manages pauta access"
  ON public.pauta_access FOR ALL
  TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email','')) = 'growth@wescale.com.br')
  WITH CHECK (lower(coalesce(auth.jwt() ->> 'email','')) = 'growth@wescale.com.br');
