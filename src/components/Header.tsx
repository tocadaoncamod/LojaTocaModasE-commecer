import React, { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  favoriteCount: number;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onUserClick?: () => void;
  isUserLoggedIn?: boolean;
  userName?: string;
  onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartItemCount, 
  favoriteCount,
  onCartClick, 
  onFavoritesClick,
  onUserClick,
  isUserLoggedIn = false,
  userName,
  onSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <header className="bg-[#FEE600] shadow-md sticky top-0 z-40 border-b-2 border-yellow-300">
      {/* Top bar with search and actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <img 
                src="https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=60&h=60" 
                alt="Logotipo Onça" 
                className="w-8 h-8 object-cover rounded-full"
              />
              Toca da Onça
            </h1>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos, marcas, categorias..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-12 text-gray-700 bg-white border border-yellow-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-blue-600" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile search icon */}
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 text-blue-900 hover:text-blue-800 transition-colors bg-white rounded-full shadow-sm hover:shadow-md"
            >
              <Search className="h-6 w-6" />
            </button>

            {/* User account */}
            <button 
              onClick={onUserClick}
              className={`hidden sm:flex items-center gap-2 p-2 transition-colors rounded-full shadow-sm hover:shadow-md ${
                isUserLoggedIn 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-white text-blue-900 hover:text-blue-800'
              }`}
              title={isUserLoggedIn ? `Logado como ${userName}` : 'Fazer login (use email/senha)'}
            >
              <User className="h-6 w-6" />
              {isUserLoggedIn && userName && (
                <span className="text-sm font-bold max-w-24 truncate">
                  {userName}
                </span>
              )}
              {isUserLoggedIn && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>

            {/* Favorites */}
            <button 
              onClick={onFavoritesClick}
              className="hidden sm:block relative p-2 text-blue-900 hover:text-blue-800 transition-colors bg-white rounded-full shadow-sm hover:shadow-md"
              title="Meus Favoritos"
            >
              <Heart className="h-6 w-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Shopping cart */}
            <button 
              onClick={onCartClick}
              className="relative bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Carrinho</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="lg:hidden px-4 pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar produtos, marcas, categorias..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-12 text-gray-700 bg-white border border-yellow-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-blue-600" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;