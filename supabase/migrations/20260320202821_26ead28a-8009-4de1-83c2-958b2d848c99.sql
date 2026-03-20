
CREATE TABLE public.conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id text,
  marca_id uuid REFERENCES public.marcas(id) ON DELETE SET NULL,
  canal text NOT NULL,
  channel_id text NOT NULL,
  titulo text,
  resumo text,
  texto_completo text,
  imagem_url text,
  status text NOT NULL DEFAULT 'pendente',
  data_agendada timestamptz,
  data_publicada timestamptz,
  marca_nome text,
  tom_de_voz text
);

ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to conteudos" ON public.conteudos
  FOR ALL USING (true) WITH CHECK (true);
