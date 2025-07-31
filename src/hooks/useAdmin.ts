import { useState, useCallback } from 'react';
import { AdminUser, Order, Customer, DashboardStats } from '../types/admin';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = useCallback(async (): Promise<Order[]> => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        return [];
      }


      if (ordersData) {
        const formattedOrders: Order[] = ordersData.map(order => ({
          id: order.id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.customer_address,
          items: order.order_items.map((item: any) => ({
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            imageUrl: item.image_url
          })),
          total: parseFloat(order.total),
          status: order.status,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at)
        }));
        
        return formattedOrders;
      }
      return [];
    } catch (error) {
      return [];
    }
  }, []);

  const loadCustomers = useCallback(async (): Promise<Customer[]> => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('customer_name, customer_phone, customer_address, total, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      if (ordersData) {
        // Agrupar clientes únicos por telefone
        const uniqueCustomers = new Map<string, Customer>();
        
        ordersData.forEach(order => {
          if (!uniqueCustomers.has(order.customer_phone)) {
            uniqueCustomers.set(order.customer_phone, {
              id: order.customer_phone,
              name: order.customer_name,
              phone: order.customer_phone,
              address: order.customer_address,
              totalOrders: 1,
              totalSpent: parseFloat(order.total),
              lastOrderDate: new Date(order.created_at)
            });
          } else {
            const customer = uniqueCustomers.get(order.customer_phone)!;
            customer.totalOrders += 1;
            customer.totalSpent += parseFloat(order.total);
            const orderDate = new Date(order.created_at);
            if (orderDate > customer.lastOrderDate) {
              customer.lastOrderDate = orderDate;
            }
          }
        });
        
        const customersArray = Array.from(uniqueCustomers.values());
        return customersArray;
      }
      return [];
    } catch (error) {
      return [];
    }
  }, []);

  // Carregar dados quando o usuário faz login
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const user = await AuthService.loginAdmin(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Carregar dados após login bem-sucedido
        const [loadedOrders, loadedCustomers] = await Promise.all([loadOrders(), loadCustomers()]);
        
        // Definir os dados no estado
        setOrders(loadedOrders);
        setCustomers(loadedCustomers);
        
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadOrders, loadCustomers]);

  // Função para recarregar dados
  const refreshData = useCallback(async () => {
    if (isAuthenticated) {
      setIsLoading(true);
      try {
        const [loadedOrders, loadedCustomers] = await Promise.all([loadOrders(), loadCustomers()]);
        setOrders(loadedOrders);
        setCustomers(loadedCustomers);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, loadOrders, loadCustomers]);

  const logout = useCallback(() => {
    AuthService.logoutAdmin();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setOrders([]);
    setCustomers([]);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AdminUser>): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const { currentPassword, ...profileUpdates } = updates;
      setCurrentUser(prev => prev ? { ...prev, ...profileUpdates } : null);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [currentUser]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    return true;
  }, [currentUser]);

  const getDashboardStats = useCallback((): DashboardStats => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = customers.length;
    const totalProducts = 0; // Will be updated when products are loaded
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const monthlyRevenue = totalRevenue; // Could be filtered by current month

    const productStats = new Map<number, { name: string; sales: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productStats.has(item.productId)) {
          const stats = productStats.get(item.productId)!;
          stats.sales += item.quantity;
          stats.revenue += item.price * item.quantity;
        } else {
          productStats.set(item.productId, {
            name: item.productName,
            sales: item.quantity,
            revenue: item.price * item.quantity
          });
        }
      });
    });
    
    const topProducts = Array.from(productStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      monthlyRevenue,
      topProducts
    };
  }, [orders, customers]);

  return {
    isAuthenticated,
    currentUser,
    orders,
    customers,
    isLoading,
    login,
    logout,
    refreshData,
    updateProfile,
    updatePassword,
    getDashboardStats
  };
};