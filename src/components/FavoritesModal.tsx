import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { FavoriteItem } from '../hooks/useFavorites';
import { Product } from '../data/products';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: number) => void;
  onAddToCart: (product: Product) => void;
  onClearFavorites: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onClearFavorites
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleAddToCart = (favorite: FavoriteItem) => {
    const product: Product = {
      id: favorite.id,
      name: favorite.name,
      price: favorite.price,
      oldPrice: favorite.oldPrice,
      imageUrl: favorite.imageUrl,
      category: favorite.category
    };
    onAddToCart(product);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm md:max-w-md h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-blue-800 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Meus Favoritos
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                Adicione produtos aos favoritos clicando no coração!
              </p>
              <button
                onClick={onClose}
                className="bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {favorites.length} produto{favorites.length !== 1 ? 's' : ''} favorito{favorites.length !== 1 ? 's' : ''}
                </p>
                {favorites.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja remover todos os favoritos?')) {
                        onClearFavorites();
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Limpar Tudo
                  </button>
                )}
              </div>

              <div className="space-y-3 md:space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg">
                    <img
                      src={favorite.imageUrl}
                      alt={favorite.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 mb-1">
                        {favorite.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 font-bold text-sm md:text-base">
                          {formatPrice(favorite.price)}
                        </span>
                        {favorite.oldPrice && (
                          <span className="text-gray-500 line-through text-xs md:text-sm">
                            {formatPrice(favorite.oldPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Adicionado em {formatDate(favorite.addedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(favorite)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                        title="Adicionar ao carrinho"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemoveFavorite(favorite.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;