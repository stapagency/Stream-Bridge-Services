/*
  # Create Customers Table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `company_name` (text, required) - Customer company name
      - `logo_url` (text, nullable) - URL to customer logo image
      - `description` (text, required) - One-line description of the customer
      - `category` (text, required) - Category: Retail, Restaurants, Wholesale, Corporate
      - `is_active` (boolean) - Whether the customer is displayed on the site
      - `order_position` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `customers` table
    - Add policies for public read access (anyone can view active customers)
    - Add policies for authenticated admin users to manage customers
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  logo_url text,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Corporate',
  is_active boolean NOT NULL DEFAULT true,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active customers"
  ON customers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated admins can view all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

-- Add some sample customers
INSERT INTO customers (company_name, logo_url, description, category, order_position) VALUES
  ('Metro Foods', null, 'Leading grocery chain with 50+ locations across the region', 'Retail', 1),
  ('TechCorp Solutions', null, 'Fortune 500 technology company with regional headquarters', 'Corporate', 2),
  ('Ocean View Restaurant Group', null, 'Premium dining establishments serving coastal cuisine', 'Restaurants', 3),
  ('BuildRight Construction', null, 'Commercial construction and development company', 'Corporate', 4),
  ('FreshMart Supermarkets', null, 'Family-owned supermarket chain serving local communities', 'Retail', 5),
  ('Golden Palace Dining', null, 'Award-winning restaurant and catering services', 'Restaurants', 6),
  ('Wholesale Distribution Co.', null, 'Regional distributor of industrial supplies and equipment', 'Wholesale', 7),
  ('City Medical Center', null, 'State-of-the-art healthcare facility and medical campus', 'Corporate', 8);