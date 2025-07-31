import React from 'react';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import FeaturedSection from './components/FeaturedSection';
import ProductGrid from './components/ProductGrid';
import BenefitsSection from './components/BenefitsSection';
import CartModal from './components/CartModal';
import UserModal from './components/UserModal';
import FavoritesModal from './components/FavoritesModal';
import { useCart } from './hooks/useCart';
import { useFavorites } from './hooks/useFavorites';
import { useAdmin } from './hooks/useAdmin';
import { useSeller } from './hooks/useSeller';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import SellerLogin from './components/seller/SellerLogin';
import SellerPanel from './components/seller/SellerPanel';
import AuthCallback from './pages/AuthCallback';
import { supabase } from './lib/supabase';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSeller, setShowSeller] = useState(false);
  const [showSupabaseTest, setShowSupabaseTest] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const { cart, lastAddedProduct, showAddedFeedback, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { 
    favorites, 
    favoriteCount, 
    lastAddedFavorite, 
    showAddedFeedback: showFavoriteFeedback, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite, 
    clearFavorites 
  } = useFavorites();
  const { isAuthenticated, currentUser: adminUser, orders, customers, login, logout, refreshData } = useAdmin();
  const { 
    isAuthenticated: isSellerAuthenticated, 
    currentSeller, 
    isLoading: isSellerLoading,
    login: sellerLogin, 
    logout: sellerLogout 
  } = useSeller();

  // Função para inicializar usuários automaticamente
  const initializeUsers = async () => {
    // Verificar se já foi inicializado anteriormente
    const isInitialized = localStorage.getItem('users_initialized');
    if (isInitialized) return;
    
    try {
      // Verificar se usuários já existem
      const { data: existingUsers, error: checkError } = await supabase
        .from('admin_users')
        .select('username')
        .in('username', ['admin', 'vendedor']);

      if (checkError) {
        console.log('Erro ao verificar usuários existentes:', checkError);
        return;
      }

      const existingUsernames = existingUsers?.map(u => u.username) || [];
      const usersToCreate = [];

      // Criar usuário admin se não existir
      if (!existingUsernames.includes('admin')) {
        usersToCreate.push({
          username: 'admin',
          password: '2025Prosper@',
          role: 'admin',
          display_name: 'Administrador',
          email: 'admin@tocadaonca.com'
        });
      }

      // Criar usuário vendedor se não existir
      if (!existingUsernames.includes('vendedor')) {
        usersToCreate.push({
          username: 'vendedor',
          password: '2025Prosper@',
          role: 'admin', // Usando 'admin' para evitar erro de constraint
          display_name: 'Loja Toca da Onça',
          email: 'vendedor@tocadaonca.com'
        });
      }

      // Inserir usuários que não existem
      if (usersToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert(usersToCreate, { ignoreDuplicates: true });

        if (insertError) {
          console.log('Erro ao criar usuários:', insertError);
        } else {
          console.log('✅ Usuários criados automaticamente:', usersToCreate.map(u => u.username));
        }
      }

      // Marcar como inicializado no localStorage
      localStorage.setItem('users_initialized', 'true');
    } catch (error) {
      console.log('Aviso: Inicialização de usuários não completada:', error);
      // Marcar como inicializado mesmo com erro para evitar loops
      localStorage.setItem('users_initialized', 'true');
    }
  };

  // Verificar se usuário está logado ao carregar
  const checkUserSession = async () => {
    try {
      console.log('🔍 Verificando sessão do usuário...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        console.log('✅ Sessão existente encontrada:', session.user.email);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
    }
  };

  // Função para logout do usuário
  const handleUserLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('User logout error:', error);
      setCurrentUser(null);
    }
  };

  // Função para lidar com clique no botão de usuário
  const handleUserClick = () => {
    if (currentUser) {
      // Se logado, mostrar opções (por enquanto só logout)
      if (window.confirm('Deseja sair da sua conta?')) {
        handleUserLogout();
      }
    } else {
      // Se não logado, abrir modal de login
      setIsUserModalOpen(true);
    }
  };

  const handleGlobalSearch = (searchTerm: string) => {
    setGlobalSearchTerm(searchTerm);
    // Scroll to products section if searching
    if (searchTerm.trim()) {
      const productsSection = document.querySelector('#products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    setShowAdmin(window.location.hash === '#admin');
    setShowSeller(window.location.hash === '#seller');
    setShowSupabaseTest(window.location.hash === '#supabase-test');
    
    // Inicializar usuários automaticamente
    initializeUsers();
    
    // Verificar sessão do usuário
    checkUserSession();
    
    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        console.log('✅ Usuário logado:', session.user.email);
        // Fechar modal de usuário se estiver aberto
        setIsUserModalOpen(false);
        
        // Mostrar feedback de sucesso
        if (window.location.hash !== '#callback') {
          const userName = session.user.user_metadata?.name || 
                          session.user.user_metadata?.full_name ||
                          session.user.email?.split('@')[0] ||
                          'Usuário';
          
          // Usar setTimeout para evitar conflito com outros alerts
          setTimeout(() => {
            alert(`🎉 Bem-vindo, ${userName}!`);
          }, 500);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        console.log('👋 Usuário deslogado');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token renovado');
      } else if (event === 'USER_UPDATED') {
        console.log('👤 Usuário atualizado');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // If supabase test is active, show test interface
  if (showSupabaseTest) {
    return (
      <div className="min-h-screen bg-white">
        <SupabaseConnectionTest />
      </div>
    );
  }

  // If seller panel is active, show seller dashboard
  if (showSeller) {
    return (
      <div className="min-h-screen bg-white">
        {isSellerAuthenticated && currentSeller ? (
          <SellerPanel 
            seller={currentSeller}
            onLogout={() => {
              sellerLogout();
              setShowSeller(false);
              window.location.hash = '';
            }} 
          />
        ) : (
          <SellerLogin 
            onLogin={sellerLogin}
            isLoading={isSellerLoading}
          />
        )}
      </div>
    );
  }

  // If admin is active, show only admin interface
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-white">
        {isAuthenticated && adminUser ? (
          <AdminPanel 
            user={adminUser} 
            orders={orders}
            customers={customers}
            onRefreshData={refreshData}
            onLogout={() => {
              logout();
              setShowAdmin(false);
              window.location.hash = '';
            }} 
          />
        ) : (
          <AdminLogin 
            onLogin={login}
          />
        )}
      </div>
    );
  }

  // Normal ecommerce interface
  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItemCount={cart.itemCount}
        favoriteCount={favoriteCount}
        onCartClick={() => setIsCartOpen(true)}
        onFavoritesClick={() => setIsFavoritesOpen(true)}
        onUserClick={handleUserClick}
        isUserLoggedIn={!!currentUser}
        userName={
          currentUser?.user_metadata?.name || 
          currentUser?.user_metadata?.full_name ||
          currentUser?.email?.split('@')[0] ||
          'Usuário'
        }
        onSearch={handleGlobalSearch}
      />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturedSection />
        <div id="products-section">
          <ProductGrid 
            onAddToCart={addToCart}
            onToggleFavorite={addToFavorites}
            isFavorite={isFavorite}
            searchTerm={globalSearchTerm}
          />
        </div>
        <BenefitsSection />
      </main>
      
      <Footer />
      
      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart.items}
        total={cart.total}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
      
      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFromFavorites}
        onAddToCart={addToCart}
        onClearFavorites={clearFavorites}
      />
      
      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
      
      {/* Added to Favorites Feedback */}
      {showFavoriteFeedback && lastAddedFavorite && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Adicionado aos favoritos!</p>
            <p className="text-xs opacity-90">{lastAddedFavorite.name}</p>
          </div>
        </div>
      )}
      
      {/* Added to Cart Feedback */}
      {showAddedFeedback && lastAddedProduct && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-500 text-lg">✓</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Produto adicionado!</p>
            <p className="text-xs opacity-90">{lastAddedProduct.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;