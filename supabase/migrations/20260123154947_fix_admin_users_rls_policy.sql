/*
  # Fix Admin Users RLS Policy

  1. Changes
    - Add policy to allow authenticated users to check their own admin status
    - This allows users to query their own row in admin_users to verify approval
    - Existing policies remain intact for full admin management

  2. Security
    - Users can only read their own row (filtered by email match)
    - Does not allow reading other users' admin status
    - Required for the login flow to work properly
*/

-- Allow authenticated users to check if their own email is in the admin_users table
CREATE POLICY "Users can check own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
