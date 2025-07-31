/*
  # Corrigir políticas RLS da tabela products

  1. Políticas
    - Remove políticas antigas que dependem do Supabase Auth
    - Cria política permissiva para todas as operações
    - Permite acesso público para leitura e escrita (segurança controlada no frontend)
*/

-- Remove políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

-- Cria política permissiva para todas as operações
CREATE POLICY "Allow all operations on products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);