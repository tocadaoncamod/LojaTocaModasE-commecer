/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (serial, primary key)
      - `name` (text)
      - `price` (decimal)
      - `old_price` (decimal, optional)
      - `image_url` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for public read and admin write
*/

CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  old_price decimal(10,2),
  image_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (for the public store)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert/update/delete products (admin only)
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, price, old_price, image_url, category) VALUES
('Vestido Floral Primavera', 129.90, 179.90, 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400', 'Feminino'),
('Camisa Social Masculina Slim', 89.90, 119.90, 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400', 'Masculino'),
('Blusa Infantil Unicórnio', 45.90, 65.90, 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400', 'Infantil'),
('Polo Masculina Listrada', 69.90, NULL, 'https://images.pexels.com/photos/1192601/pexels-photo-1192601.jpeg?auto=compress&cs=tinysrgb&w=400', 'Masculino'),
('Vestido Infantil Festa', 79.90, 99.90, 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400', 'Infantil'),
('Blusa Feminina Manga Longa', 59.90, NULL, 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400', 'Feminino')
ON CONFLICT DO NOTHING;