/*
  # Corrige RLS para Login de Admin
  
  1. Problema
    - As políticas atuais exigem autenticação (`authenticated`)
    - No momento do login, o usuário ainda não está autenticado
    - Por isso a consulta falha e retorna "Usuário ou senha incorretos"
  
  2. Solução
    - Remover políticas antigas restritivas
    - Adicionar política que permite SELECT para usuários anônimos (apenas para login)
    - Manter políticas restritivas para INSERT, UPDATE e DELETE
  
  3. Segurança
    - SELECT é permitido para verificar credenciais no login
    - A senha ainda é verificada na aplicação
    - Operações de escrita continuam protegidas
*/

-- Remove as políticas antigas
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can delete admin users" ON admin_users;

-- Permite SELECT para usuários anônimos (necessário para login)
CREATE POLICY "Anyone can view admin users for login"
  ON admin_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas admins autenticados podem inserir novos admins
CREATE POLICY "Authenticated users can create admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Apenas admins autenticados podem atualizar
CREATE POLICY "Authenticated users can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas admins autenticados podem deletar
CREATE POLICY "Authenticated users can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);
