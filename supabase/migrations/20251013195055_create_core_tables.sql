/*
  # Create Core E-commerce Tables

  ## Overview
  This migration creates the foundational tables for the fashion e-commerce platform including products, orders, users, and suppliers.

  ## New Tables
  
  ### 1. products
  - `id` (bigserial, primary key) - Auto-incrementing product ID
  - `name` (text) - Product name
  - `price` (numeric) - Current price
  - `old_price` (numeric, optional) - Previous price for discount display
  - `image_url` (text) - Product image URL
  - `category` (text) - Product category
  - `description` (text, optional) - Product description
  - `stock` (integer) - Available stock quantity
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. orders
  - `id` (uuid, primary key) - Order ID
  - `customer_name` (text) - Customer full name
  - `customer_phone` (text) - Customer phone number
  - `customer_address` (text) - Delivery address
  - `total` (numeric) - Order total amount
  - `status` (text) - Order status (pending, confirmed, shipped, delivered, cancelled)
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last status update

  ### 3. order_items
  - `id` (uuid, primary key) - Order item ID
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `product_id` (bigint) - Product reference
  - `product_name` (text) - Product name snapshot
  - `quantity` (integer) - Quantity ordered
  - `price` (numeric) - Price at time of order
  - `image_url` (text) - Product image snapshot

  ### 4. admin_users
  - `id` (uuid, primary key) - Admin user ID
  - `username` (text, unique) - Login username
  - `password` (text) - Hashed password
  - `display_name` (text, optional) - Display name
  - `email` (text, optional) - Email address
  - `profile_image` (text, optional) - Profile image URL
  - `role` (text) - Admin role (admin, manager)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. suppliers
  - `id` (uuid, primary key) - Supplier ID
  - `name` (text) - Supplier company name
  - `contact_name` (text) - Contact person name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `address` (text, optional) - Supplier address
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated admin access
  - Public read access for products
  - Authenticated access for orders
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  old_price numeric(10, 2),
  image_url text NOT NULL DEFAULT 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
  category text NOT NULL DEFAULT 'Geral',
  description text,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT ''
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  display_name text,
  email text,
  profile_image text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Products policies: Public read access, admin write access
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies: Authenticated access
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Order items policies: Follow parent order access
CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (true);

-- Admin users policies: Authenticated admin access only
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- Suppliers policies: Authenticated access
CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);