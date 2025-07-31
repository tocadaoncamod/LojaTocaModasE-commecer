import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  LogOut,
  Menu,
  X,
  Store
} from 'lucide-react';
import { SellerUser } from '../../hooks/useSeller';
import SellerDashboard from './SellerDashboard';
import SellerProductManagement from '../seller/SellerProductManagement';
import SellerSalesManagement from '../seller/SellerSalesManagement';
import SellerProfile from './SellerProfile';

interface SellerPanelProps {
  seller: SellerUser;
  onLogout: () => void;
}

type ActiveTab = 'dashboard' | 'products' | 'sales';

const SellerPanel: React.FC<SellerPanelProps> = ({ seller, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentSeller, setCurrentSeller] = useState<SellerUser>(seller);
  const [triggerAddProduct, setTriggerAddProduct] = useState(false);

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
      id: 'sales' as ActiveTab,
      label: 'Vendas',
      icon: ShoppingBag,
      color: 'text-purple-600'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SellerDashboard seller={currentSeller} />;
      case 'products':
        return <SellerProductManagement seller={currentSeller} triggerAddProduct={triggerAddProduct} onAddProductTriggered={() => setTriggerAddProduct(false)} />;
      case 'sales':
        return <SellerSalesManagement seller={currentSeller} />;
      default:
        return <SellerDashboard seller={currentSeller} />;
    }
  };

  const handleProfileUpdate = async (updatedSeller: Partial<SellerUser>): Promise<boolean> => {
    setCurrentSeller(prev => ({ ...prev, ...updatedSeller }));
    return true;
  };

  // Escutar eventos das ações rápidas
  useEffect(() => {
    const handleOpenAddProduct = () => {
      setActiveTab('products');
      setTriggerAddProduct(true);
    };

    const handleNavigateToSales = () => {
      setActiveTab('sales');
    };

    window.addEventListener('openAddProduct', handleOpenAddProduct);
    window.addEventListener('navigateToSales', handleNavigateToSales);

    return () => {
      window.removeEventListener('openAddProduct', handleOpenAddProduct);
      window.removeEventListener('navigateToSales', handleNavigateToSales);
    };
  }, []);

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
                <p className="text-sm text-gray-500">Painel Vendedor</p>
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
              {currentSeller.profileImage ? (
                <img
                  src={currentSeller.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-blue-600 font-semibold text-sm">
                  {(currentSeller.displayName || currentSeller.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentSeller.displayName || currentSeller.username}
              </p>
              <p className="text-xs text-gray-500">{currentSeller.storeName}</p>
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
      
      {/* Seller Profile Modal */}
      <SellerProfile
        seller={currentSeller}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default SellerPanel;