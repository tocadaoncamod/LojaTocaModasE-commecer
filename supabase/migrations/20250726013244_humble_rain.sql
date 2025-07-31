/*
  # Fix supplier_products RLS policies

  1. Security Updates
    - Remove restrictive RLS policies on supplier_products table
    - Add permissive policies for anonymous and authenticated users
    - Allow all operations (INSERT, SELECT, UPDATE, DELETE)

  2. Changes Made
    - Drop existing restrictive policies
    - Create new policies allowing anonymous access
    - Ensure compatibility with admin authentication system
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage supplier products" ON supplier_products;

-- Create new permissive policies for anonymous users (admin system)
CREATE POLICY "Allow anonymous access to supplier_products"
  ON supplier_products
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users as well (future compatibility)
CREATE POLICY "Allow authenticated access to supplier_products"
  ON supplier_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);