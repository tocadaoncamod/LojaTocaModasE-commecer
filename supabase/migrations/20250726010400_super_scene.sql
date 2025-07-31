/*
  # Allow anonymous access to suppliers table

  1. Security Changes
    - Remove existing restrictive RLS policy on suppliers table
    - Add new policy allowing anonymous users to manage suppliers
    - This enables admin operations without Supabase auth integration

  2. Important Notes
    - This allows anonymous users to manage suppliers
    - Required because admin system uses custom auth, not Supabase auth
    - For production, consider integrating with Supabase auth for better security
*/

-- Remove existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;

-- Create new policy allowing anonymous access for suppliers management
CREATE POLICY "Allow anonymous access to suppliers"
  ON suppliers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Also allow authenticated users (for future compatibility)
CREATE POLICY "Allow authenticated access to suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);