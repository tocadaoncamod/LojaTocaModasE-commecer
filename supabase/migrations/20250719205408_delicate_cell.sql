/*
  # Create orders and order_items tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_address` (text)
      - `total` (decimal)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (integer, foreign key)
      - `product_name` (text)
      - `quantity` (integer)
      - `price` (decimal)
      - `image_url` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users (admin)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  total decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Authenticated users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for order_items
CREATE POLICY "Authenticated users can manage order_items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample orders
INSERT INTO orders (id, customer_name, customer_phone, customer_address, total, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Maria Silva', '(12) 99999-1234', 'Rua das Flores, 123 - Centro - São José dos Campos - SP', 259.80, 'pending'),
('550e8400-e29b-41d4-a716-446655440002', 'João Santos', '(12) 98888-5678', 'Av. Principal, 456 - Jardim das Flores - São José dos Campos - SP', 89.90, 'confirmed')
ON CONFLICT DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'Vestido Floral Primavera', 2, 129.90, 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'Camisa Social Masculina Slim', 1, 89.90, 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT DO NOTHING;