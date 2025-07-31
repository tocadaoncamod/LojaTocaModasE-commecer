/*
  # Melhorias de Segurança Avançada

  1. Políticas RLS para teste_produtos_extraidos
  2. Correção de funções com search_path
  3. Configurações de segurança
  4. Logs de auditoria aprimorados
*/

-- 1. HABILITAR RLS na tabela teste_produtos_extraidos
ALTER TABLE teste_produtos_extraidos ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS RLS para teste_produtos_extraidos

-- Política para leitura pública (produtos são públicos)
CREATE POLICY "Permitir leitura pública de produtos" 
ON public.teste_produtos_extraidos 
FOR SELECT 
TO public
USING (true);

-- Política para inserção apenas para administradores
CREATE POLICY "Permitir inserção apenas para administradores" 
ON public.teste_produtos_extraidos 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Política para atualização apenas para administradores
CREATE POLICY "Permitir atualização apenas para administradores" 
ON public.teste_produtos_extraidos 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Política para exclusão apenas para administradores
CREATE POLICY "Permitir exclusão apenas para administradores" 
ON public.teste_produtos_extraidos 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
);

-- 3. CORREÇÃO DE FUNÇÕES COM SEARCH_PATH

-- Corrigir função update_suppliers_updated_at
CREATE OR REPLACE FUNCTION public.update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Definir search_path explicitamente para segurança
  SET search_path TO public, pg_temp;
  
  -- Atualizar timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Definir search_path explicitamente para segurança
  SET search_path TO public, pg_temp;
  
  -- Atualizar timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. APRIMORAR TABELA DE LOGS DE SEGURANÇA

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_logs_log_type_timestamp 
ON public.security_logs (log_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_email_timestamp 
ON public.security_logs (user_email, timestamp DESC);

-- Adicionar função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  -- Definir search_path explicitamente
  SET search_path TO public, pg_temp;
  
  -- Remover logs mais antigos que 90 dias
  DELETE FROM public.security_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Log da limpeza
  INSERT INTO public.security_logs (
    log_type, 
    metadata, 
    timestamp
  ) VALUES (
    'log_cleanup_executed',
    jsonb_build_object('cleaned_at', NOW()),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA AUDITORIA DE MUDANÇAS DE SENHA

CREATE OR REPLACE FUNCTION public.log_password_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Definir search_path explicitamente
  SET search_path TO public, pg_temp;
  
  -- Log apenas se a senha foi realmente alterada
  IF OLD.password IS DISTINCT FROM NEW.password THEN
    INSERT INTO public.security_logs (
      log_type,
      user_email,
      metadata,
      timestamp
    ) VALUES (
      'admin_password_changed',
      NEW.email,
      jsonb_build_object(
        'user_id', NEW.id,
        'username', NEW.username,
        'changed_at', NOW()
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para mudanças de senha de admin
DROP TRIGGER IF EXISTS track_admin_password_changes ON public.admin_users;
CREATE TRIGGER track_admin_password_changes
  AFTER UPDATE OF password ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_password_change();

-- 6. POLÍTICA DE RETENÇÃO DE DADOS

-- Criar função para executar limpeza automática (pode ser chamada via cron)
CREATE OR REPLACE FUNCTION public.security_maintenance()
RETURNS void AS $$
BEGIN
  -- Definir search_path explicitamente
  SET search_path TO public, pg_temp;
  
  -- Limpeza de logs antigos
  PERFORM public.cleanup_old_security_logs();
  
  -- Limpeza de tokens de reset expirados
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < NOW();
  
  -- Log da manutenção
  INSERT INTO public.security_logs (
    log_type,
    metadata,
    timestamp
  ) VALUES (
    'security_maintenance_completed',
    jsonb_build_object(
      'executed_at', NOW(),
      'maintenance_type', 'automated'
    ),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS

-- Garantir que todas as tabelas sensíveis tenham RLS habilitado
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON FUNCTION public.update_suppliers_updated_at() IS 'Função segura para atualizar timestamp de fornecedores';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Função segura para atualizar timestamp genérico';
COMMENT ON FUNCTION public.log_password_change() IS 'Auditoria de mudanças de senha de administradores';
COMMENT ON FUNCTION public.cleanup_old_security_logs() IS 'Limpeza automática de logs antigos (90+ dias)';
COMMENT ON FUNCTION public.security_maintenance() IS 'Manutenção automática de segurança';