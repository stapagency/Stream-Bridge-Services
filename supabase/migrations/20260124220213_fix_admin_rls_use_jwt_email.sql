/*
  # Fix Admin RLS Using JWT Email

  1. Changes
    - Create a helper function to extract email from JWT
    - Update RLS policies to use JWT email instead of querying auth.users
  
  2. Security
    - Uses auth.jwt() which is built into Supabase
    - Policies remain restrictive and prevent recursion
*/

-- Create a helper function to get the current user's email from JWT
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'email',
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can view all records" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can insert" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can update" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can delete" ON admin_users;

-- Recreate policies using JWT email

-- Policy 1: Users can view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (email = get_user_email());

-- Policy 2: Approved admins can view all admin records
CREATE POLICY "Approved admins can view all records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_approved_admin(get_user_email()));

-- Policy 3: Approved admins can insert new admin users
CREATE POLICY "Approved admins can insert"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_approved_admin(get_user_email()));

-- Policy 4: Approved admins can update admin users
CREATE POLICY "Approved admins can update"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (is_approved_admin(get_user_email()))
  WITH CHECK (is_approved_admin(get_user_email()));

-- Policy 5: Approved admins can delete admin users
CREATE POLICY "Approved admins can delete"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (is_approved_admin(get_user_email()));
