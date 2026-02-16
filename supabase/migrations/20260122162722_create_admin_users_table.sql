/*
  # Create Admin Users Table for Access Control

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Email of the approved admin user
      - `approved_by` (uuid) - ID of the admin who approved this user
      - `approved_at` (timestamptz) - When the user was approved
      - `is_active` (boolean) - Whether the admin user is currently active
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on admin_users table
    - Only authenticated users who are themselves approved admins can view the list
    - Only approved admins can add new admin users
    - Only approved admins can update admin user status

  3. Initial Data
    - The first admin user must be manually added to the table to bootstrap the system
    - This can be done by inserting the email of the first admin directly

  4. Notes
    - This table controls who can access the admin portal
    - Users not in this table with is_active=true cannot access admin features
    - Existing auth.users accounts may exist, but access is controlled by this table
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Approved admins can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  );

CREATE POLICY "Approved admins can insert new admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  );

CREATE POLICY "Approved admins can update admin users"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  );

CREATE POLICY "Approved admins can delete admin users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
