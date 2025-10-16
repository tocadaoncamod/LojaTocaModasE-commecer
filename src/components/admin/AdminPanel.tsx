import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  Truck,
  LogOut,
  Menu,
  X,
  Brain,
  Share2
} from 'lucide-react';
import { AdminUser } from '../../types/admin';
import { Order, Customer, DashboardStats } from '../../types/admin';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';
import SellerManagement from './SellerManagement';
import SupplierManagement from './SupplierManagement';
import AdminProfile from './AdminProfile';
import AIPanel from './AIPanel';
import SocialMediaPanel from './SocialMediaPanel';

interface AdminPanelProps {
  user: AdminUser;
  onLogout: () => void;
  orders: Order[];
  customers: Customer[];
  onRefreshData: () => void;
}

type ActiveTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'sellers' | 'suppliers' | 'ai' | 'social';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout, orders, customers, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser>(user);

  const getDashboardStats = (): DashboardStats => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = customers.length;
    const totalProducts = 0;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const monthlyRevenue = totalRevenue;

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
  };

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: 'products' as ActiveTab,
      label: 'Produtos',
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Pedidos',
      icon: ShoppingBag,
      color: 'text-purple-600'
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Clientes',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      id: 'sellers' as ActiveTab,
      label: 'Vendedores',
      icon: Store,
      color: 'text-purple-600'
    },
    {
      id: 'suppliers' as ActiveTab,
      label: 'Fornecedores',
      icon: Truck,
      color: 'text-orange-600'
    },
    {
      id: 'ai' as ActiveTab,
      label: 'Inteligência Artificial',
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      id: 'social' as ActiveTab,
      label: 'Redes Sociais',
      icon: Share2,
      color: 'text-blue-600'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={getDashboardStats()} onRefresh={onRefreshData} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement orders={orders} onRefresh={onRefreshData} />;
      case 'customers':
        return <CustomerManagement customers={customers} />;
      case 'sellers':
        return <SellerManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'ai':
        return <AIPanel />;
      case 'social':
        return <SocialMediaPanel />;
      default:
        return <AdminDashboard stats={getDashboardStats()} />;
    }
  };

  const handleProfileUpdate = async (updatedUser: Partial<AdminUser>): Promise<boolean> => {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
    return true;
  };

  const handlePasswordUpdate = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed top-0 left-0 lg:h-screen
        w-64 bg-white shadow-lg z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto lg:overflow-y-auto lg:flex lg:flex-col
      `}>
        <div className="p-6 border-b border-gray-200 lg:flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xl">🐆</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Toca da Onça</h2>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 lg:flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                    transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? item.color : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 lg:flex-shrink-0 lg:mt-auto">
          <button
            className="w-full flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={() => setShowProfile(true)}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {currentUser.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
              </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentUser.displayName || currentUser.username}
              </p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        {/* Mobile Menu Button */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <main className="p-6 lg:flex-1">
          {renderContent()}
        </main>
      </div>
      
      {/* Admin Profile Modal */}
      <AdminProfile
        user={currentUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpdate={handleProfileUpdate}
        onUpdatePassword={handlePasswordUpdate}
      />
    </div>
  );
};

export default AdminPanel;