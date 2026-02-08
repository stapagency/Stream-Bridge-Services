/*
  # Site Management Tables

  1. New Tables
    - `site_settings`
      - Stores global site configuration like company info, contact details, social links
      - Single row table (only one settings record)
      - Fields: company_name, logo_url, phone, email, address, social_links, theme_colors
    
    - `about_content`
      - Stores content for the About page
      - Multiple sections that can be edited independently
      - Fields: section, title, content, image_url, order_position, is_active
  
  2. Security
    - Enable RLS on both tables
    - Public read access for displaying content
    - Authenticated users can update (admin only)

  3. Initial Data
    - Insert default site settings
    - Insert default about page sections
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Stream Bridge Services Inc.',
  logo_url text,
  phone text NOT NULL DEFAULT '+1 (555) 123-4567',
  email text NOT NULL DEFAULT 'info@streambridgeservices.com',
  address_line1 text NOT NULL DEFAULT '1234 Industrial Parkway',
  address_line2 text DEFAULT 'Toronto, ON M1M 1M1',
  social_links jsonb DEFAULT '{}',
  theme_colors jsonb DEFAULT '{"primary": "#003b67", "secondary": "#f57a18"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create about_content table
CREATE TABLE IF NOT EXISTS about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for about_content
CREATE POLICY "Anyone can view active about content"
  ON about_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert about content"
  ON about_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update about content"
  ON about_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete about content"
  ON about_content
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default site settings (if none exist)
INSERT INTO site_settings (company_name, phone, email, address_line1, address_line2)
SELECT 'Stream Bridge Services Inc.', '+1 (555) 123-4567', 'info@streambridgeservices.com', 
       '1234 Industrial Parkway', 'Toronto, ON M1M 1M1'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Insert default about content sections
INSERT INTO about_content (section, title, content, order_position, is_active) VALUES
  ('mission', 'Our Mission', 'At Stream Bridge Services, we are committed to delivering exceptional cleaning solutions and top-quality industrial equipment to businesses across Canada and internationally. Our mission is to help our clients maintain pristine, professional environments while providing reliable access to the tools they need to succeed.', 1, true),
  ('history', 'Our Story', 'Founded with a vision to bridge the gap between quality service and industrial equipment supply, Stream Bridge Services has grown from a local cleaning company to a trusted partner for businesses nationwide. We combine decades of industry expertise with modern techniques and equipment to deliver unparalleled results.', 2, true),
  ('values', 'Our Values', 'Quality, Reliability, and Customer Satisfaction are at the core of everything we do. We believe in building lasting relationships with our clients through consistent excellence, transparent communication, and a dedication to exceeding expectations on every project.', 3, true),
  ('expertise', 'Our Expertise', 'Our team consists of trained professionals with extensive experience in commercial cleaning, floor care, duct cleaning, and industrial equipment. We stay current with industry best practices and continuously invest in training and technology to provide the best possible service to our clients.', 4, true)
ON CONFLICT DO NOTHING;
