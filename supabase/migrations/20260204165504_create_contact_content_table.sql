/*
  # Create contact page content table

  1. New Tables
    - `contact_content`
      - `id` (uuid, primary key) - Unique identifier
      - `section` (text) - Section identifier (hero, contact_info, form, cta, location)
      - `title` (text) - Section title
      - `subtitle` (text) - Section subtitle or description
      - `phone_primary` (text) - Primary phone number
      - `phone_secondary` (text) - Secondary phone number
      - `phone_hours` (text) - Phone availability hours
      - `email_primary` (text) - Primary email address
      - `email_secondary` (text) - Secondary email address
      - `email_response_time` (text) - Email response time note
      - `address_line1` (text) - Address line 1
      - `address_line2` (text) - Address line 2
      - `address_line3` (text) - Address line 3
      - `business_hours_line1` (text) - Business hours line 1
      - `business_hours_line2` (text) - Business hours line 2
      - `business_hours_line3` (text) - Business hours line 3
      - `emergency_note` (text) - Emergency services note
      - `cta_phone` (text) - CTA section phone
      - `cta_email` (text) - CTA section email
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `contact_content` table
    - Add policy for public to read contact content
    - Add policy for authenticated admin users to manage content

  3. Initial Data
    - Insert default contact content for all sections
*/

CREATE TABLE IF NOT EXISTS contact_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  phone_primary text DEFAULT '',
  phone_secondary text DEFAULT '',
  phone_hours text DEFAULT '',
  email_primary text DEFAULT '',
  email_secondary text DEFAULT '',
  email_response_time text DEFAULT '',
  address_line1 text DEFAULT '',
  address_line2 text DEFAULT '',
  address_line3 text DEFAULT '',
  business_hours_line1 text DEFAULT '',
  business_hours_line2 text DEFAULT '',
  business_hours_line3 text DEFAULT '',
  emergency_note text DEFAULT '',
  cta_phone text DEFAULT '',
  cta_email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view contact content"
  ON contact_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin users can insert contact content"
  ON contact_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can update contact content"
  ON contact_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can delete contact content"
  ON contact_content
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
    )
  );

-- Insert default content
INSERT INTO contact_content (section, title, subtitle, phone_primary, phone_secondary, phone_hours, email_primary, email_secondary, email_response_time, address_line1, address_line2, address_line3, business_hours_line1, business_hours_line2, business_hours_line3, emergency_note, cta_phone, cta_email)
VALUES 
  (
    'hero',
    'Contact Us',
    'Get in touch with us today for a free consultation and quote',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ),
  (
    'contact_info',
    'Get In Touch',
    'Have questions or need a quote? Our team is here to help. Reach out to us through any of the methods below, and we''ll respond promptly.',
    '+1 (555) 123-4567',
    '+1 (555) 987-6543',
    'Mon-Fri: 8AM - 6PM EST',
    'info@streambridgeservices.com',
    'sales@streambridgeservices.com',
    'We respond within 24 hours',
    '1234 Industrial Parkway',
    'Toronto, ON M1M 1M1',
    'Canada',
    'Monday - Friday: 8:00 AM - 6:00 PM',
    'Saturday: 9:00 AM - 4:00 PM',
    'Sunday: Closed',
    'Emergency services available 24/7',
    '', ''
  ),
  (
    'form',
    'Send Us a Message',
    'Fill out the form below and we''ll get back to you as soon as possible',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ),
  (
    'cta',
    'Need Immediate Assistance?',
    'For urgent matters or emergency services, don''t hesitate to call us directly',
    '', '', '', '', '', '',
    '', '', '', '', '', '', '',
    '+1 (555) 123-4567',
    'info@streambridgeservices.com'
  ),
  (
    'location',
    'Visit Our Location',
    'Stop by our office to discuss your needs in person',
    '', '', '', '', '', '',
    '1234 Industrial Parkway',
    'Toronto, ON M1M 1M1',
    'Canada',
    '', '', '', '', '', ''
  )
ON CONFLICT (section) DO NOTHING;
