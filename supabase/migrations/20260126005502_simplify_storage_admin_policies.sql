/*
  # Simplify storage admin policies with inline checks

  1. Changes
    - Remove dependency on is_admin_user() function for storage
    - Use inline JWT email check directly in policies
    - This avoids function execution context issues in storage
    
  2. Security
    - Directly checks if JWT email exists in admin_users table
    - Maintains same security level with simpler implementation
    - Works reliably in storage policy context
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete images" ON storage.objects;

-- Create storage policies with inline checks (no function dependency)
CREATE POLICY "Admin users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  )
  WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );
