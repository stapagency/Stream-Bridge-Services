/*
  # Fix Storage Admin Check Function
  
  1. Changes
    - Fix the is_admin_user() function to properly retrieve email from JWT
    - Use auth.jwt() instead of auth.email() for storage context
    - This allows storage policies to correctly verify admin status
  
  2. Security
    - Maintains same security model: only active admins can upload/modify images
    - Public can still view all images in the bucket
*/

-- Drop and recreate the admin check function with proper JWT email extraction
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get email from JWT token
  user_email := COALESCE(
    auth.jwt() ->> 'email',
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
  
  -- Check if this email is an active admin
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = user_email
    AND is_active = true
  );
END;
$$;
