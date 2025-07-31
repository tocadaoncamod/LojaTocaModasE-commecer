import React, { useState, useEffect } from 'react';
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Star
} from 'lucide-react';
import { SellerUser } from '../../hooks/useSeller';
import { supabase } from '../../lib/supabase';

interface SellerDashboardProps {
  seller: SellerUser;
}

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: number;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ seller }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    topProducts: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Carregar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Erro ao carregar produtos:', productsError);
        return;
      }

      // Por enquanto, usar dados mock para vendas
      const mockStats: DashboardStats = {
        totalProducts: products?.length || 0,
        totalSales: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
        topProducts: []
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Meus Produtos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total de Vendas',
      value: stats.totalSales,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Receita Total',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 min-h-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xl">🐆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard do Vendedor</h1>
              <p className="text-gray-600">Bem-vindo, {seller.storeName}!</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-yellow-400 to-blue-600 rounded-lg p-8 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">🐆 Bem-vindo à Toca da Onça!</h2>
          <p className="text-xl mb-6">
            Comece a vender seus produtos e alcance milhares de clientes!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-4">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Adicione Produtos</h3>
              <p className="text-sm opacity-90">Cadastre seus produtos com fotos e descrições</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Gerencie Vendas</h3>
              <p className="text-sm opacity-90">Acompanhe seus pedidos e vendas</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Receba Comissões</h3>
              <p className="text-sm opacity-90">Ganhe dinheiro com cada venda realizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              // Navegar para a aba de produtos e abrir modal de adicionar
              window.dispatchEvent(new CustomEvent('openAddProduct'));
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Adicionar Produto</p>
            <p className="text-sm text-gray-500">Cadastre um novo produto</p>
          </button>
          
          <button 
            onClick={() => {
              // Navegar para a aba de vendas
              window.dispatchEvent(new CustomEvent('navigateToSales'));
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Ver Vendas</p>
            <p className="text-sm text-gray-500">Acompanhe suas vendas</p>
          </button>
          
          <button 
            onClick={() => {
              // Mostrar relatórios ou navegar para dashboard
              alert('📊 Relatórios em desenvolvimento!\n\nEm breve você terá acesso a:\n• Relatório de vendas\n• Gráficos de performance\n• Análise de produtos\n• Comissões detalhadas');
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Relatórios</p>
            <p className="text-sm text-gray-500">Veja seus relatórios</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;