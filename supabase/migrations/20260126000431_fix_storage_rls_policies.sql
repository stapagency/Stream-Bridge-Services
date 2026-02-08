/*
  # Fix Storage RLS Policies for Image Uploads

  1. Changes
    - Drop and recreate storage policies to fix any conflicts
    - Simplify policies to ensure authenticated users can upload
    - Add explicit admin check using email verification
    - Ensure policies work with current authentication setup

  2. Security
    - Authenticated admins (verified via admin_users table) can upload, update, and delete
    - Public users can view all images
    - Uses auth.email() to verify admin status
*/

-- Drop all existing storage policies for the images bucket
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = auth.email() 
    AND is_active = true
  );
END;
$$;

-- Policy: Allow public read access to all files in the images bucket
CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Policy: Allow authenticated admin users to upload files to the images bucket
CREATE POLICY "Admin users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' 
    AND public.is_admin_user()
  );

-- Policy: Allow authenticated admin users to update files in the images bucket
CREATE POLICY "Admin users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND public.is_admin_user()
  )
  WITH CHECK (
    bucket_id = 'images' 
    AND public.is_admin_user()
  );

-- Policy: Allow authenticated admin users to delete files from the images bucket
CREATE POLICY "Admin users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' 
    AND public.is_admin_user()
  );
