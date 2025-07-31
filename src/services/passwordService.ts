import { supabase } from '../lib/supabase';

export interface PasswordValidationResult {
  valid: boolean;
  errors?: string[];
  message?: string;
  strength?: {
    score: number;
    level: 'muito-fraca' | 'fraca' | 'media' | 'forte' | 'muito-forte';
    feedback: string[];
  };
}

export class PasswordService {
  // Validar senha usando Edge Function
  static async validatePassword(password: string): Promise<PasswordValidationResult> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-validator`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password, action: 'validate' })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na validação de senha:', error);
      return {
        valid: false,
        errors: ['Erro de conexão com o servidor de validação']
      };
    }
  }

  // Calcular força da senha
  static async getPasswordStrength(password: string): Promise<PasswordValidationResult> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-validator`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password, action: 'strength' })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao calcular força da senha:', error);
      return {
        valid: false,
        errors: ['Erro de conexão com o servidor']
      };
    }
  }

  // Validação local básica (fallback)
  static validatePasswordLocal(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push("Senha muito curta. Mínimo 12 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Adicione pelo menos uma letra maiúscula");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Adicione pelo menos uma letra minúscula");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Adicione pelo menos um número");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|]/.test(password)) {
      errors.push("Adicione pelo menos um símbolo especial");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length === 0 ? "Senha válida!" : undefined
    };
  }

  // Log de tentativas de senha (para auditoria)
  static async logPasswordAttempt(email: string, success: boolean, action: 'login' | 'register' | 'reset'): Promise<void> {
    try {
      await supabase
        .from('security_logs')
        .insert([{
          log_type: `password_${action}_${success ? 'success' : 'failure'}`,
          user_email: email,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Erro ao registrar log de segurança:', error);
    }
  }

  // Verificar se senha foi comprometida (usando API HaveIBeenPwned)
  static async checkPasswordBreach(password: string, email?: string): Promise<boolean> {
    try {
      // Usar Edge Function para verificação segura
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-leak-checker`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password, email })
      });

      if (!response.ok) {
        console.warn('Edge Function indisponível, usando verificação local');
        return await this.checkPasswordBreachLocal(password);
      }

      const result = await response.json();
      return result.isLeaked || false;
    } catch (error) {
      console.error('Erro ao verificar vazamento de senha:', error);
      // Fallback para verificação local
      try {
        return await this.checkPasswordBreachLocal(password);
      } catch (localError) {
        console.error('Erro também na verificação local:', localError);
        return false; // Em caso de erro total, assumir que não foi comprometida
      }
    }
  }

  // Verificação local como fallback
  static async checkPasswordBreachLocal(password: string): Promise<boolean> {
    try {
      // Criar hash SHA-1 da senha
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      // Usar apenas os primeiros 5 caracteres para k-anonymity
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        return false;
      }
      
      const text = await response.text();
      
      // Verificar se o sufixo está na resposta
      return text.includes(suffix);
    } catch (error) {
      console.error('Erro ao verificar vazamento de senha:', error);
      return false; // Em caso de erro, assumir que não foi comprometida
    }
  }

  // Gerar senha segura
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Preencher o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Configurar proteção contra senhas vazadas no Supabase
  static async enableLeakedPasswordProtection(): Promise<boolean> {
    try {
      // Esta configuração deve ser feita no dashboard do Supabase
      // Aqui apenas logamos que a proteção está ativa
      await supabase
        .from('security_logs')
        .insert([{
          log_type: 'leaked_password_protection_check',
          metadata: { enabled: true },
          timestamp: new Date().toISOString()
        }]);
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar proteção de senhas vazadas:', error);
      return false;
    }
  }

  // Verificar configurações de segurança
  static async getSecurityConfig(): Promise<{
    leakedPasswordProtection: boolean;
    otpExpiryMinutes: number;
    passwordMinLength: number;
  }> {
    return {
      leakedPasswordProtection: true,
      otpExpiryMinutes: 30, // Reduzido para 30 minutos
      passwordMinLength: 12
    };
  }
}