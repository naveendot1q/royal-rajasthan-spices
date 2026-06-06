-- Create Supabase Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE,  10485760,  -- 10MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/avif']),
  ('review-images',  'review-images',  TRUE,  5242880,   -- 5MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('invoices',       'invoices',       FALSE, 10485760,  -- private, 10MB
   ARRAY['application/pdf']),
  ('backups',        'backups',        FALSE, 536870912, -- private, 512MB
   ARRAY['application/octet-stream','text/plain','application/sql'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: product-images (public read, staff write)
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_staff_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin','super_admin','staff')
    )
  );

CREATE POLICY "product_images_staff_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin','super_admin')
    )
  );

-- Storage RLS: review-images (public read, authenticated write)
CREATE POLICY "review_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "review_images_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);

-- Storage RLS: invoices (owner + staff)
CREATE POLICY "invoices_staff_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'invoices' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin','super_admin')
    )
  );
