/*
  # Social Media Integration Tables
  
  1. New Tables
    - `social_media_accounts` - Connected social media accounts
    - `instagram_products` - Products synced to Instagram
    - `facebook_products` - Products synced to Facebook
    - `youtube_videos` - Product videos on YouTube
    - `whatsapp_messages` - WhatsApp messages sent/received
    - `whatsapp_conversations` - WhatsApp conversation threads
    - `whatsapp_templates` - WhatsApp message templates
    - `social_media_posts` - Scheduled and published posts
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
*/

-- Social Media Accounts Table
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id bigserial PRIMARY KEY,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube', 'whatsapp')),
  account_id text NOT NULL,
  account_name text NOT NULL,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  is_connected boolean DEFAULT true,
  last_sync timestamptz,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(platform, account_id)
);

ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage social accounts"
  ON social_media_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Instagram Products Table
CREATE TABLE IF NOT EXISTS instagram_products (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  instagram_id text,
  catalog_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'deleted')),
  posted_at timestamptz,
  post_url text,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instagram_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage Instagram products"
  ON instagram_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Facebook Products Table
CREATE TABLE IF NOT EXISTS facebook_products (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  facebook_id text,
  catalog_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'deleted')),
  shop_url text,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facebook_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage Facebook products"
  ON facebook_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- YouTube Videos Table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_id text,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'failed', 'scheduled')),
  scheduled_for timestamptz,
  uploaded_at timestamptz,
  published_at timestamptz,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage YouTube videos"
  ON youtube_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id bigserial PRIMARY KEY,
  to_number text NOT NULL,
  from_number text,
  message_type text NOT NULL CHECK (message_type IN ('text', 'image', 'template', 'order', 'notification')),
  content text NOT NULL,
  media_url text,
  template_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage WhatsApp messages"
  ON whatsapp_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- WhatsApp Conversations Table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id bigserial PRIMARY KEY,
  customer_id uuid,
  customer_phone text NOT NULL,
  customer_name text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  assigned_to uuid,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage conversations"
  ON whatsapp_conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('marketing', 'transactional', 'otp')),
  language text DEFAULT 'pt_BR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  components jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage templates"
  ON whatsapp_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Social Media Posts Table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id bigserial PRIMARY KEY,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube')),
  account_id bigint REFERENCES social_media_accounts(id),
  product_ids bigint[],
  content text NOT NULL,
  media_urls text[],
  scheduled_for timestamptz,
  published_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage posts"
  ON social_media_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_instagram_products_product_id ON instagram_products(product_id);
CREATE INDEX IF NOT EXISTS idx_facebook_products_product_id ON facebook_products(product_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_product_id ON youtube_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_status ON youtube_videos(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_to_number ON whatsapp_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_customer_phone ON whatsapp_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_status ON whatsapp_conversations(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
