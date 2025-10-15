/*
  # Criar Tabelas de Variações de Produtos
  
  1. Nova Tabela: product_sizes
    - id (bigint, primary key)
    - product_id (bigint, foreign key)
    - size_name (text) - Ex: P, M, G, GG, 38, 40, 42
    - stock_quantity (integer) - Estoque disponível
    - additional_price (numeric) - Preço adicional (se houver)
    - is_available (boolean) - Disponível para venda
    - created_at (timestamptz)
  
  2. Nova Tabela: product_colors
    - id (bigint, primary key)
    - product_id (bigint, foreign key)
    - color_name (text) - Nome da cor
    - color_hex (text) - Código hexadecimal
    - image_url (text) - Imagem da variação de cor
    - stock_quantity (integer)
    - is_available (boolean)
    - created_at (timestamptz)
  
  3. Nova Tabela: product_reviews
    - id (bigint, primary key)
    - product_id (bigint, foreign key)
    - customer_name (text)
    - rating (integer) - 1 a 5 estrelas
    - comment (text)
    - verified_purchase (boolean)
    - created_at (timestamptz)
  
  4. Nova Tabela: product_questions
    - id (bigint, primary key)
    - product_id (bigint, foreign key)
    - customer_name (text)
    - question (text)
    - answer (text)
    - answered_at (timestamptz)
    - created_at (timestamptz)
  
  5. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas públicas para leitura
    - Políticas públicas para escrita (será refinado em produção)
*/

-- Tabela de Tamanhos
CREATE TABLE IF NOT EXISTS product_sizes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_name text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  additional_price numeric DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Cores
CREATE TABLE IF NOT EXISTS product_colors (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text,
  image_url text,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS product_reviews (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Perguntas
CREATE TABLE IF NOT EXISTS product_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  question text NOT NULL,
  answer text,
  answered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_product_id ON product_questions(product_id);

-- Habilitar RLS
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_sizes
CREATE POLICY "Public can view product sizes"
  ON product_sizes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can manage product sizes"
  ON product_sizes FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para product_colors
CREATE POLICY "Public can view product colors"
  ON product_colors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can manage product colors"
  ON product_colors FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para product_reviews
CREATE POLICY "Public can view product reviews"
  ON product_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create product reviews"
  ON product_reviews FOR INSERT
  TO public
  WITH CHECK (true);

-- Políticas RLS para product_questions
CREATE POLICY "Public can view product questions"
  ON product_questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create product questions"
  ON product_questions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can manage product questions"
  ON product_questions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
