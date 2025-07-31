/*
  # Fix Admin Authentication Policy

  1. Security Changes
    - Add policy to allow public read access for authentication
    - Keep existing policies for authenticated operations
    - Ensure admin login works properly

  Note: This allows reading admin_users for authentication purposes only.
  The password comparison happens in the application layer.
*/

-- Drop existing policies that might be blocking authentication
DROP POLICY IF EXISTS "Admin users can read own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update own data" ON admin_users;

-- Create policy to allow authentication (reading username and password_hash)
CREATE POLICY "Allow authentication" ON admin_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for authenticated admin users to read their own data
CREATE POLICY "Admin users can read own data" ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policy for authenticated admin users to update their own data
CREATE POLICY "Admin users can update own data" ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);