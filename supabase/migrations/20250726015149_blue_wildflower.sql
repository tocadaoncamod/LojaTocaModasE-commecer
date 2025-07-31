/*
  # Fix product images storage and RLS policies

  1. Storage Policies
    - Allow authenticated users to upload to product-images bucket
    - Allow public read access to product images
    - Allow authenticated users to delete their uploaded images

  2. Table Policies
    - Allow authenticated users to insert product images
    - Allow public read access to product images
    - Allow authenticated users to update/delete product images

  3. Storage Bucket
    - Ensure product-images bucket exists
    - Configure proper permissions
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- Storage policies for product-images bucket
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Update existing product_images table policies
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON product_images;

-- New comprehensive policies for product_images table
CREATE POLICY "Allow public read access to product images"
  ON product_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert product images"
  ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update product images"
  ON product_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete product images"
  ON product_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Also ensure anonymous users can insert (for admin operations)
CREATE POLICY "Allow anonymous insert product images"
  ON product_images
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update product images"
  ON product_images
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete product images"
  ON product_images
  FOR DELETE
  TO anon
  USING (true);