/*
  # Fix Admin RLS with Security Definer Function

  1. Changes
    - Drop the existing problematic RLS policy
    - Create a security definer function to check admin status (bypasses RLS)
    - Create simple RLS policies that don't cause recursion
  
  2. Security
    - Function uses SECURITY DEFINER to bypass RLS
    - Users can only check their own status via the policy
    - Approved admins can view all users
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own status or all if approved admin" ON admin_users;
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can insert admin users" ON admin_users;

-- Create a security definer function to check if a user is an approved admin
-- This function bypasses RLS
CREATE OR REPLACE FUNCTION is_approved_admin(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE email = check_email
    AND is_active = true
  );
END;
$$;

-- Create simple policies that don't cause recursion

-- Policy 1: Users can view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 2: Approved admins can view all admin records
-- Uses the function to avoid recursion
CREATE POLICY "Approved admins can view all records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    is_approved_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Policy 3: Approved admins can insert new admin users
CREATE POLICY "Approved admins can insert"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_approved_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Policy 4: Approved admins can update admin users
CREATE POLICY "Approved admins can update"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    is_approved_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    is_approved_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Policy 5: Approved admins can delete admin users
CREATE POLICY "Approved admins can delete"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    is_approved_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );
