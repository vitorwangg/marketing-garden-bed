
-- Permissive policy for marcas (mock auth, tighten later)
CREATE POLICY "Allow all access to marcas" ON public.marcas
  FOR ALL USING (true) WITH CHECK (true);

-- Storage policies for brand_logos bucket
CREATE POLICY "Allow public read brand_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand_logos');

CREATE POLICY "Allow insert brand_logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand_logos');

CREATE POLICY "Allow update brand_logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand_logos');
