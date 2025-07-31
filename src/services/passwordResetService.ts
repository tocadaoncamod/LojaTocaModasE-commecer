import { supabase } from '../lib/supabase';
import { PasswordResetToken } from '../types/seller';

export class PasswordResetService {
  // Gerar token de recuperação
  static async generateResetToken(email: string, userType: 'admin' | 'seller'): Promise<boolean> {
    try {
      // Verificar se usuário existe
      let userId: string | null = null;
      
      if (userType === 'admin') {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', email)
          .single();
        
        userId = adminUser?.id;
      } else {
        const { data: seller } = await supabase
          .from('sellers')
          .select('id')
          .eq('whatsapp', email) // Usando whatsapp como identificador
          .single();
        
        userId = seller?.id;
      }

      if (!userId) {
        return false;
      }

      // Gerar token único
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

      // Salvar token no banco
      const { error } = await supabase
        .from('password_reset_tokens')
        .insert([{
          user_type: userType,
          user_id: userId,
          email,
          token,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) {
        console.error('Erro ao salvar token:', error);
        return false;
      }

      // Aqui você enviaria o email com o token
      // Por enquanto, vamos apenas logar no console
      console.log(`Token de recuperação para ${email}: ${token}`);
      console.log(`Link de recuperação: ${window.location.origin}/reset-password?token=${token}`);

      return true;
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      return false;
    }
  }

  // Validar token
  static async validateToken(token: string): Promise<PasswordResetToken | null> {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userType: data.user_type,
        userId: data.user_id,
        email: data.email,
        token: data.token,
        expiresAt: new Date(data.expires_at),
        usedAt: data.used_at ? new Date(data.used_at) : undefined,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return null;
    }
  }

  // Resetar senha
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Validar token
      const tokenData = await this.validateToken(token);
      if (!tokenData) {
        return false;
      }

      // Atualizar senha
      let updateError: any = null;
      
      if (tokenData.userType === 'admin') {
        const { error } = await supabase
          .from('admin_users')
          .update({ password: newPassword })
          .eq('id', tokenData.userId);
        
        updateError = error;
      } else {
        // Para vendedores, você pode implementar uma tabela de senhas separada
        // ou usar o sistema de autenticação do Supabase
        console.log('Reset de senha para vendedor ainda não implementado');
        return false;
      }

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return false;
      }

      // Marcar token como usado
      await supabase
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return false;
    }
  }

  // Limpar tokens expirados
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
    }
  }
}