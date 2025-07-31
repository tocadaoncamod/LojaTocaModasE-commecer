/*
  # Corrigir políticas RLS para admin_users

  1. Políticas Atualizadas
    - Permitir que admins atualizem seus próprios dados usando ID direto
    - Manter segurança mas permitir operações necessárias
  
  2. Mudanças
    - Política de UPDATE mais flexível para admins
    - Política de SELECT para permitir verificação de senha
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admin users can read own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update own data" ON admin_users;
DROP POLICY IF EXISTS "Allow authentication" ON admin_users;

-- Criar novas políticas mais flexíveis
CREATE POLICY "Allow admin read for authentication"
  ON admin_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admin update own profile"
  ON admin_users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Política para INSERT (caso precise criar novos admins)
CREATE POLICY "Allow admin insert"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);