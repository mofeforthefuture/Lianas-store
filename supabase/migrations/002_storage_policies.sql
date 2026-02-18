-- Create storage buckets via Supabase Dashboard: Storage > New bucket
-- 1. product-images (Public)
-- 2. payment-receipts (Private)
-- Then run this migration to add RLS policies on storage.objects.

-- Allow public read for product-images
CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admins can upload/update/delete product images (role check via profiles)
CREATE POLICY "Admins insert product-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins update product-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins delete product-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- payment-receipts: users upload to their own folder; users read own; admins read all
CREATE POLICY "Users upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins read all receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
