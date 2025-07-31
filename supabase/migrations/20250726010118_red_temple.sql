/*
  # Fix suppliers table RLS policy

  1. Security Updates
    - Drop existing restrictive policy on suppliers table
    - Add new policy allowing authenticated users to manage suppliers
    - Ensure admins can create, read, update suppliers

  2. Changes
    - Remove old policy that was blocking supplier creation
    - Add comprehensive policy for authenticated users
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for authenticated users
*/

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;

-- Create new comprehensive policy for suppliers
CREATE POLICY "Authenticated users can manage suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);