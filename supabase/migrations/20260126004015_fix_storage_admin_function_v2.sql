/*
  # Fix admin user function for storage context

  1. Changes
    - Drop storage policies that depend on is_admin_user()
    - Drop and recreate is_admin_user() function with better JWT email extraction
    - Recreate storage policies with the updated function
    
  2. Security
    - Function uses SECURITY DEFINER for auth.users access
    - Checks admin_users table for authorization
    - Policies remain restrictive
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete images" ON storage.objects;

-- Drop and recreate function
DROP FUNCTION IF EXISTS is_admin_user();

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_id uuid;
BEGIN
  -- Get the user ID from auth
  user_id := auth.uid();
  
  -- If no user ID, not authenticated
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get email directly from auth.users table
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- If no email found, return false
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this email is an active admin
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = user_email
    AND is_active = true
  );
END;
$$;

-- Recreate storage policies for images bucket
CREATE POLICY "Admin users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    is_admin_user()
  );

CREATE POLICY "Admin users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    is_admin_user()
  )
  WITH CHECK (
    bucket_id = 'images' AND
    is_admin_user()
  );

CREATE POLICY "Admin users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    is_admin_user()
  );
