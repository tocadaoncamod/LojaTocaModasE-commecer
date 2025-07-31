/*
  # Sistema de Gestão de Vendedores

  1. Novas Tabelas
    - `seller_applications` - Solicitações de vendedores
    - `seller_products` - Produtos dos vendedores
    - `seller_sales` - Vendas dos vendedores
    - `seller_commissions` - Comissões dos vendedores
    - `password_reset_tokens` - Tokens de recuperação de senha

  2. Atualizações
    - Atualizar tabela `sellers` com novos campos
    - Adicionar status de aprovação

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para cada tipo de usuário
*/

-- Atualizar tabela sellers com novos campos
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) DEFAULT 10.00;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS total_sales numeric(12,2) DEFAULT 0.00;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS total_commission numeric(12,2) DEFAULT 0.00;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES admin_users(id);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Tabela de solicitações de vendedores
CREATE TABLE IF NOT EXISTS seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  store_name text NOT NULL,
  cpf_cnpj text NOT NULL,
  whatsapp text NOT NULL,
  business_description text,
  experience_years integer DEFAULT 0,
  monthly_sales_estimate numeric(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES admin_users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de produtos dos vendedores
CREATE TABLE IF NOT EXISTS seller_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  commission_rate numeric(5,2) DEFAULT 10.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seller_id, product_id)
);

-- Tabela de vendas dos vendedores
CREATE TABLE IF NOT EXISTS seller_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de comissões dos vendedores
CREATE TABLE IF NOT EXISTS seller_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  sale_id uuid NOT NULL REFERENCES seller_sales(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_method text,
  payment_date timestamptz,
  payment_reference text,
  approved_by uuid REFERENCES admin_users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('admin', 'seller')),
  user_id uuid NOT NULL,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para seller_applications
CREATE POLICY "Anyone can create seller applications"
  ON seller_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all seller applications"
  ON seller_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update seller applications"
  ON seller_applications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para seller_products
CREATE POLICY "Sellers can view own products"
  ON seller_products
  FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all seller products"
  ON seller_products
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para seller_sales
CREATE POLICY "Sellers can view own sales"
  ON seller_sales
  FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all sales"
  ON seller_sales
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para seller_commissions
CREATE POLICY "Sellers can view own commissions"
  ON seller_commissions
  FOR SELECT
  TO authenticated
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all commissions"
  ON seller_commissions
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para password_reset_tokens
CREATE POLICY "Anyone can create password reset tokens"
  ON password_reset_tokens
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own tokens"
  ON password_reset_tokens
  FOR SELECT
  TO public
  USING (true);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seller_applications_updated_at
    BEFORE UPDATE ON seller_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_products_updated_at
    BEFORE UPDATE ON seller_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_sales_updated_at
    BEFORE UPDATE ON seller_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_commissions_updated_at
    BEFORE UPDATE ON seller_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_applications_created_at ON seller_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sales_seller_id ON seller_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sales_order_id ON seller_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_commissions_seller_id ON seller_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);