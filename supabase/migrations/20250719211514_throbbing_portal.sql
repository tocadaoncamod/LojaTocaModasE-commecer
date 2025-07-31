/*
  # Adicionar campos de perfil para admin_users

  1. Alterações na Tabela
    - Adicionar `display_name` (text) - Nome de exibição do admin
    - Adicionar `email` (text) - Email do admin  
    - Adicionar `profile_image` (text) - URL da foto de perfil

  2. Segurança
    - Manter políticas RLS existentes
    - Permitir UPDATE dos novos campos pelos próprios admins

  3. Dados
    - Inserir admin padrão se não existir
*/

-- Adicionar novas colunas à tabela admin_users existente
DO $$
BEGIN
  -- Adicionar display_name se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN display_name text;
  END IF;

  -- Adicionar email se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN email text;
  END IF;

  -- Adicionar profile_image se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN profile_image text;
  END IF;
END $$;

-- Atualizar política RLS para permitir UPDATE dos novos campos
DROP POLICY IF EXISTS "Admin users can update own data" ON admin_users;

CREATE POLICY "Admin users can update own data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Inserir admin padrão se não existir
INSERT INTO admin_users (username, password_hash, role, display_name, email)
VALUES ('admin', 'admin', 'admin', 'Administrador', 'admin@tocadaonca.com')
ON CONFLICT (username) DO UPDATE SET
  display_name = COALESCE(admin_users.display_name, EXCLUDED.display_name),
  email = COALESCE(admin_users.email, EXCLUDED.email);