/*
  # Create Storage Bucket for Images

  1. Storage Setup
    - Creates a public storage bucket named 'images' for storing uploaded files
    - Configured with 5MB file size limit
    - Public access enabled for reading uploaded images
  
  2. Security Policies
    - Allow authenticated users to upload files (INSERT)
    - Allow authenticated users to update their uploaded files (UPDATE)
    - Allow authenticated users to delete files (DELETE)
    - Allow public read access to all uploaded images (SELECT)
  
  3. Important Notes
    - This bucket will store all site images including logos, product images, service images, etc.
    - Files are organized in folders: branding/, products/, services/, uploads/, etc.
    - All authenticated admin users can manage all files in the bucket
*/

-- Create the images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Policy: Allow public read access to all files in the images bucket
CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Policy: Allow authenticated users to upload files to the images bucket
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Policy: Allow authenticated users to update files in the images bucket
CREATE POLICY "Authenticated users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

-- Policy: Allow authenticated users to delete files from the images bucket
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');
