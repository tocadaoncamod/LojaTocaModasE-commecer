/*
  # Create suppliers and supplier_products tables

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `name` (text, supplier name)
      - `vendizap_url` (text, Vendizap catalog URL)
      - `catalog_url` (text, general catalog URL)
      - `description` (text, optional description)
      - `phone` (text, contact phone)
      - `email` (text, contact email)
      - `whatsapp` (text, WhatsApp contact)
      - `status` (text, active/inactive/pending)
      - `categories` (jsonb, array of categories)
      - `last_sync` (timestamptz, last synchronization)
      - `total_products` (integer, total products count)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `supplier_products`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key to suppliers)
      - `supplier_product_id` (text, product ID from supplier)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `original_price` (numeric, original price)
      - `image_url` (text, product image URL)
      - `category` (text, product category)
      - `availability` (text, in_stock/out_of_stock/limited)
      - `sku` (text, product SKU)
      - `sizes` (jsonb, available sizes)
      - `colors` (jsonb, available colors)
      - `vendizap_data` (jsonb, raw data from Vendizap)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage suppliers
    - Add policies for viewing supplier products
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vendizap_url text NOT NULL,
  catalog_url text NOT NULL,
  description text,
  phone text,
  email text,
  whatsapp text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  categories jsonb DEFAULT '[]'::jsonb,
  last_sync timestamptz,
  total_products integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create supplier_products table
CREATE TABLE IF NOT EXISTS supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  supplier_product_id text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  image_url text NOT NULL,
  category text NOT NULL,
  availability text DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'out_of_stock', 'limited')),
  sku text,
  sizes jsonb DEFAULT '[]'::jsonb,
  colors jsonb DEFAULT '[]'::jsonb,
  vendizap_data jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(supplier_id, supplier_product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_last_sync ON suppliers(last_sync);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products(category);
CREATE INDEX IF NOT EXISTS idx_supplier_products_availability ON supplier_products(availability);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Authenticated users can manage suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for supplier_products
CREATE POLICY "Authenticated users can manage supplier products"
  ON supplier_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at column for suppliers
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_suppliers_updated_at();

-- Insert sample supplier data
INSERT INTO suppliers (name, vendizap_url, catalog_url, description, whatsapp, status) VALUES
('Vendedor Bernardos', 'https://vendedorbernardos.vendizap.com/', 'https://vendedorbernardos.vendizap.com/', 'Fornecedor de roupas variadas com ótimos preços', '(11) 99999-9999', 'active')
ON CONFLICT DO NOTHING;