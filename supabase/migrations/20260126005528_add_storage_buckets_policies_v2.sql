/*
  # Add storage buckets policies

  1. Changes
    - Add SELECT policy on storage.buckets for authenticated users
    - This allows authenticated users to access bucket metadata
    - Required for storage uploads to work properly
    
  2. Security
    - Only allows reading bucket information, not modifying it
    - Authenticated users need bucket access to upload files
*/

-- Drop if exists, then create
DROP POLICY IF EXISTS "Authenticated users can view buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Public can view buckets" ON storage.buckets;

-- Allow authenticated users to view buckets
CREATE POLICY "Authenticated users can view buckets"
  ON storage.buckets
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow public to view buckets (needed for public file access)
CREATE POLICY "Public can view buckets"
  ON storage.buckets
  FOR SELECT
  TO public
  USING (true);
