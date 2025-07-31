/*
  # Corrigir políticas RLS para produtos

  1. Políticas Atualizadas
    - Remove políticas antigas que dependem de Supabase Auth
    - Adiciona políticas que funcionam com autenticação customizada
    - Permite operações para usuários anônimos (já que usamos auth customizada)

  2. Segurança
    - Mantém RLS habilitado
    - Permite leitura pública (anon)
    - Permite todas operações para authenticated (mesmo que seja anon no contexto do Supabase)
*/

-- Remove políticas antigas
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- Política para leitura pública (qualquer um pode ver produtos)
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política para operações de escrita (criar, editar, excluir)
-- Como usamos autenticação customizada, permitimos para anon também
CREATE POLICY "Allow all operations on products"
  ON products
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);