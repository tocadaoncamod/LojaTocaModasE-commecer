/*
  # Corrigir políticas RLS para admin_users

  1. Security
    - Remove políticas antigas da tabela admin_users
    - Cria nova política mais permissiva para operações de admin
    - Permite acesso público para login e operações administrativas
*/

-- Remove políticas antigas da tabela admin_users
DROP POLICY IF EXISTS "Anyone can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can read admin_users" ON admin_users;

-- Cria nova política permissiva para todas as operações
CREATE POLICY "Allow all operations on admin_users"
  ON admin_users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);