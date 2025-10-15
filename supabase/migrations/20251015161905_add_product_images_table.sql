/*
  # Adicionar Tabela de Imagens de Produtos
  
  1. Nova Tabela
    - `product_images`
      - `id` (bigint, primary key, auto-increment)
      - `product_id` (bigint, foreign key para products)
      - `image_url` (text, URL da imagem)
      - `display_order` (integer, ordem de exibição das imagens)
      - `created_at` (timestamp with time zone)
  
  2. Segurança
    - Habilitar RLS na tabela `product_images`
    - Adicionar políticas para permitir visualização pública
    - Adicionar políticas para permitir manipulação pública (CRUD)
  
  3. Notas Importantes
    - Cada produto pode ter múltiplas imagens
    - As imagens são ordenadas pelo campo `display_order`
    - A primeira imagem (display_order = 0) é considerada a imagem principal
*/

-- Criar tabela de imagens de produtos
CREATE TABLE IF NOT EXISTS product_images (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);

-- Habilitar RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can view all product images"
  ON product_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert product images"
  ON product_images FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update product images"
  ON product_images FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete product images"
  ON product_images FOR DELETE
  TO public
  USING (true);
