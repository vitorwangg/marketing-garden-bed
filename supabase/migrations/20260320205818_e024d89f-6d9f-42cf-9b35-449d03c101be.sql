INSERT INTO storage.buckets (id, name, public)
VALUES ('conteudos_midia', 'conteudos_midia', true);

CREATE POLICY "Allow public read conteudos_midia" ON storage.objects
  FOR SELECT USING (bucket_id = 'conteudos_midia');

CREATE POLICY "Allow insert conteudos_midia" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'conteudos_midia');

CREATE POLICY "Allow update conteudos_midia" ON storage.objects
  FOR UPDATE USING (bucket_id = 'conteudos_midia');