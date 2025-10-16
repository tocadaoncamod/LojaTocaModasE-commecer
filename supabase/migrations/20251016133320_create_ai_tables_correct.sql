/*
  # AI System Tables
  
  1. New Tables
    - `product_ai_metadata` - Stores AI-generated product information
    - `product_videos` - Stores generated product videos
    - `customer_behavior` - Tracks customer actions and behavior
    - `social_media_interactions` - Tracks social media engagement
    - `campaigns` - Stores automated marketing campaigns
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Product AI Metadata Table
CREATE TABLE IF NOT EXISTS product_ai_metadata (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ai_description jsonb,
  generated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_ai_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage AI metadata"
  ON product_ai_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view AI metadata"
  ON product_ai_metadata
  FOR SELECT
  TO anon
  USING (true);

-- Product Videos Table
CREATE TABLE IF NOT EXISTS product_videos (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer DEFAULT 0,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage videos"
  ON product_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view videos"
  ON product_videos
  FOR SELECT
  TO anon
  USING (true);

-- Customer Behavior Table
CREATE TABLE IF NOT EXISTS customer_behavior (
  id bigserial PRIMARY KEY,
  user_id uuid,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  search_term text,
  category text,
  order_value numeric(10, 2),
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE customer_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior"
  ON customer_behavior
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all behavior"
  ON customer_behavior
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "System can insert behavior"
  ON customer_behavior
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Social Media Interactions Table
CREATE TABLE IF NOT EXISTS social_media_interactions (
  id bigserial PRIMARY KEY,
  user_id uuid,
  platform text NOT NULL,
  action text NOT NULL,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE social_media_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view social interactions"
  ON social_media_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "System can insert social interactions"
  ON social_media_interactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  name text NOT NULL,
  discount_percentage integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  target_products bigint[],
  target_audience text[],
  channels text[],
  expected_revenue numeric(10, 2) DEFAULT 0,
  actual_revenue numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view active campaigns"
  ON campaigns
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_ai_metadata_product_id ON product_ai_metadata(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_user_id ON customer_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_product_id ON customer_behavior(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_timestamp ON customer_behavior(timestamp);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
