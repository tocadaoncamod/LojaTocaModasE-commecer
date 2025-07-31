/*
  # Fix admin password for login

  1. Updates
    - Set admin user password to plain text 'admin' for demo purposes
    - Ensures login works with credentials admin/admin

  2. Notes
    - This is for demo purposes only
    - In production, passwords should be properly hashed
*/

-- Update admin user password to plain text for demo
UPDATE admin_users 
SET password_hash = 'admin' 
WHERE username = 'admin';

-- If no admin user exists, create one
INSERT INTO admin_users (username, password_hash, role, display_name, email)
VALUES ('admin', 'admin', 'admin', 'Administrador', 'admin@tocadaonca.com')
ON CONFLICT (username) DO NOTHING;