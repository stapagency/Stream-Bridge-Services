/*
  # Add Videos Table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text) - Video title
      - `description` (text) - Video description
      - `video_url` (text) - URL to the video file in storage
      - `thumbnail_url` (text) - URL to the thumbnail image
      - `duration` (text) - Video duration (e.g., "3:45")
      - `position` (integer) - Display order (1 or 2 for the two video slots)
      - `is_active` (boolean) - Whether the video is displayed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on videos table
    - Public read access for active videos
    - Authenticated users can manage videos
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text,
  thumbnail_url text,
  duration text DEFAULT '0:00',
  position integer NOT NULL CHECK (position IN (1, 2)),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policies for videos
CREATE POLICY "Anyone can view active videos"
  ON videos
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_videos_position ON videos(position);
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active);

-- Insert default video placeholders
INSERT INTO videos (title, description, position, is_active) VALUES
  ('Our Commercial Services', 'Discover how our expert team transforms commercial spaces with professional cleaning techniques and state-of-the-art equipment.', 1, true),
  ('Equipment Showcase', 'Explore our range of industrial-grade cleaning equipment and specialized machinery for all your business needs.', 2, true)
ON CONFLICT DO NOTHING;
