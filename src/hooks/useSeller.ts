import { useState, useCallback } from 'react';
import { AuthService } from '../services/authService';

export interface SellerUser {
  id: string;
  username: string;
  role: 'seller';
  displayName?: string;
  email?: string;
  profileImage?: string;
  storeName: string;
  whatsapp: string;
  cpfCnpj: string;
}

export const useSeller = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSeller, setCurrentSeller] = useState<SellerUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o mesmo sistema de autenticação do admin
      const user = await AuthService.loginAdmin(username, password);
      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return false;
      }

      // Converter AdminUser para SellerUser
      const seller: SellerUser = {
        id: user.id,
        username: user.username,
        role: 'seller',
        displayName: user.displayName,
        email: user.email,
        profileImage: user.profileImage,
        storeName: user.role === 'admin' ? 'Administrador - Toca da Onça' : (user.displayName || user.username),
        whatsapp: '(11) 99999-9999', // Placeholder
        cpfCnpj: '000.000.000-00' // Placeholder
      };
      
      setCurrentSeller(seller);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      AuthService.logoutAdmin();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setCurrentSeller(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    isAuthenticated,
    currentSeller,
    isLoading,
    login,
    logout
  };
};