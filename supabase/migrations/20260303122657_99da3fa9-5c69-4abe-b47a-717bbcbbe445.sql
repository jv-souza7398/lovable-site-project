
-- Create storage bucket for drink images
INSERT INTO storage.buckets (id, name, public)
VALUES ('drinks-images', 'drinks-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view drink images"
ON storage.objects FOR SELECT
USING (bucket_id = 'drinks-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload drink images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'drinks-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete drink images"
ON storage.objects FOR DELETE
USING (bucket_id = 'drinks-images');
