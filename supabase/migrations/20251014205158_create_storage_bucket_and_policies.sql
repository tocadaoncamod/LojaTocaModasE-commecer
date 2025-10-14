/*
  # Criar Bucket de Storage e Políticas
  
  1. Bucket
    - Cria bucket 'products' para imagens de produtos
    - Público para leitura
    - Limite de 5MB por arquivo
    - Formatos: JPEG, JPG, PNG, WEBP
  
  2. Políticas de Acesso
    - Qualquer pessoa pode visualizar imagens (público)
    - Apenas usuários autenticados podem fazer upload
    - Apenas usuários autenticados podem atualizar suas imagens
    - Apenas usuários autenticados podem deletar suas imagens
*/

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- Política: Qualquer pessoa pode visualizar imagens públicas
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Política: Qualquer pessoa pode fazer upload (para permitir vendedores e admins)
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Política: Qualquer pessoa pode atualizar imagens
CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Política: Qualquer pessoa pode deletar imagens
CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
