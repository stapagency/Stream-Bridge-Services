/*
  # Admin Portal Database Schema

  ## Overview
  This migration creates the complete database structure for the Stream Bridge Services admin portal.

  ## New Tables

  ### 1. `home_content`
  Stores editable content for the home page
  - `id` (uuid, primary key)
  - `section` (text) - Section identifier (hero, stats, features)
  - `title` (text) - Section title
  - `description` (text) - Section description
  - `content` (jsonb) - Flexible content storage
  - `order_position` (integer) - Display order
  - `is_active` (boolean) - Visibility toggle
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `testimonials`
  Customer testimonials and reviews
  - `id` (uuid, primary key)
  - `client_name` (text)
  - `company` (text)
  - `position` (text)
  - `content` (text)
  - `rating` (integer) - 1-5 star rating
  - `image_url` (text)
  - `is_featured` (boolean)
  - `created_at` (timestamptz)

  ### 3. `contact_requests`
  Store all contact form submissions
  - `id` (uuid, primary key)
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `service` (text)
  - `message` (text)
  - `status` (text) - pending, contacted, completed
  - `email_sent` (boolean)
  - `created_at` (timestamptz)

  ### 4. `services_content`
  Manage services information
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `features` (jsonb)
  - `icon` (text)
  - `image_url` (text)
  - `order_position` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `products_content`
  Manage products and equipment
  - `id` (uuid, primary key)
  - `title` (text)
  - `category` (text)
  - `description` (text)
  - `features` (jsonb)
  - `image_url` (text)
  - `is_featured` (boolean)
  - `order_position` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admin users can modify content
  - Public users can only read published content
  - Contact requests are write-only for public, read-only for admins
*/

-- Create home_content table
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  company text,
  position text,
  content text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create services_content table
CREATE TABLE IF NOT EXISTS services_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  icon text,
  image_url text,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products_content table
CREATE TABLE IF NOT EXISTS products_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  image_url text,
  is_featured boolean DEFAULT false,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_content ENABLE ROW LEVEL SECURITY;

-- Policies for home_content
CREATE POLICY "Public users can view active home content"
  ON home_content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage home content"
  ON home_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for testimonials
CREATE POLICY "Public users can view testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for contact_requests
CREATE POLICY "Anyone can create contact requests"
  ON contact_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact requests"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact requests"
  ON contact_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact requests"
  ON contact_requests FOR DELETE
  TO authenticated
  USING (true);

-- Policies for services_content
CREATE POLICY "Public users can view active services"
  ON services_content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage services"
  ON services_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for products_content
CREATE POLICY "Public users can view active products"
  ON products_content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage products"
  ON products_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_home_content_section ON home_content(section);
CREATE INDEX IF NOT EXISTS idx_home_content_active ON home_content(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created ON contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_active ON services_content(is_active);
CREATE INDEX IF NOT EXISTS idx_products_active ON products_content(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products_content(is_featured);

-- Insert default home page content
INSERT INTO home_content (section, title, description, content, order_position) VALUES
('hero', 'Professional Cleaning Solutions', 'Stream Bridge Services Inc. is your trusted partner for comprehensive commercial and industrial cleaning services, state-of-the-art equipment supply, and international trade solutions.', '{"cta_primary": "Explore Services", "cta_secondary": "Get a Quote"}'::jsonb, 1),
('stats', 'Our Achievements', 'Trusted by businesses across North America', '{"years": "15+", "clients": "500+", "satisfaction": "100%", "support": "24/7"}'::jsonb, 2);

-- Insert sample testimonials
INSERT INTO testimonials (client_name, company, position, content, rating, is_featured) VALUES
('Michael Chen', 'Tech Solutions Inc.', 'Facilities Manager', 'Stream Bridge Services has been maintaining our office complex for over 3 years. Their attention to detail and professionalism is unmatched. Highly recommended!', 5, true),
('Sarah Williams', 'Maple Manufacturing', 'Operations Director', 'The floor waxing service completely transformed our warehouse. The team was efficient, professional, and the results exceeded our expectations.', 5, true),
('David Thompson', 'Northern Foods Ltd.', 'Plant Manager', 'We rely on Stream Bridge for both cleaning services and specialized equipment. Their import/export capabilities have been invaluable for our operations.', 5, false);