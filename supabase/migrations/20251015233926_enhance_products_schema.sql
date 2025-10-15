/*
  # Melhorias Avançadas no Schema de Produtos
  
  1. Novos Campos na Tabela Products
    - brand (text) - Marca do produto
    - sku (text, unique) - Código interno SKU
    - subcategory (text) - Subcategoria
    - material (text) - Tecido/material
    - measurements (jsonb) - Medidas em cm
    - care_instructions (text) - Instruções de lavagem
    - weight (numeric) - Peso em gramas
    - dimensions (jsonb) - Dimensões da embalagem {length, width, height}
    - shipping_time_days (integer) - Prazo de envio em dias
    - warranty_days (integer) - Garantia em dias
    - tags (text[]) - Tags para SEO
    - keywords (text) - Palavras-chave
    - featured_category (text) - Categoria destaque
    - video_url (text) - URL do vídeo
    - origin_location (text) - Local de origem
    - sales_count (integer) - Número de vendas
    - rating_average (numeric) - Avaliação média
    - is_active (boolean) - Produto ativo
    - discount_type (text) - Tipo de desconto
    - discount_value (numeric) - Valor do desconto
  
  2. Segurança
    - Manter RLS ativo
    - Políticas permissivas já existentes
*/

-- Adicionar novos campos à tabela products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS measurements jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS care_instructions text,
  ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}',
  ADD COLUMN IF NOT EXISTS shipping_time_days integer DEFAULT 7,
  ADD COLUMN IF NOT EXISTS warranty_days integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS featured_category text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS origin_location text DEFAULT 'São Paulo, SP',
  ADD COLUMN IF NOT EXISTS sales_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_average numeric DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS discount_type text CHECK (discount_type IN ('percentage', 'fixed', 'bulk', null)),
  ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0;

-- Criar índice único para SKU
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured_category ON products(featured_category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);
