/*
  # Adicionar coluna password e criar usuário admin

  1. Alterações na tabela
    - Adiciona coluna `password` na tabela `admin_users`
  
  2. Dados iniciais
    - Insere usuário admin padrão com credenciais: admin/admin
*/

-- Adicionar coluna password se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'password'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN password text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Inserir usuário admin padrão
INSERT INTO admin_users (username, password, role, display_name, email)
VALUES ('admin', 'admin', 'admin', 'Administrador', 'admin@tocadaonca.com')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;