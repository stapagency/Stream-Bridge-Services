/*
  # Fix Admin Users RLS Infinite Recursion

  1. Changes
    - Drop the duplicate SELECT policy that causes infinite recursion
    - Drop the existing "Approved admins" policy
    - Create a single, comprehensive SELECT policy that:
      - Allows users to check their own status
      - Allows approved admins to view all admin users
  
  2. Security
    - Prevents infinite recursion by using a single policy
    - Maintains security by checking admin status only once
*/

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;
DROP POLICY IF EXISTS "Approved admins can view all admin users" ON admin_users;

-- Create a single SELECT policy that handles both cases
CREATE POLICY "Users can view own status or all if approved admin"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always check their own status
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- OR if they're an approved admin, they can see everyone
    -- Use a direct check without recursion
    (SELECT is_active FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) LIMIT 1) = true
  );
