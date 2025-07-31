import { useState, useCallback, useEffect } from 'react';
import { Product } from '../data/products';

export interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  addedAt: Date;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [lastAddedFavorite, setLastAddedFavorite] = useState<Product | null>(null);

  // Carregar favoritos do localStorage ao inicializar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tocadaonca_favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        const favoritesWithDates = parsed.map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
        setFavorites(favoritesWithDates);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    }
  }, []);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('tocadaonca_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = useCallback((product: Product) => {
    const existingFavorite = favorites.find(fav => fav.id === product.id);
    
    if (existingFavorite) {
      // Se já está nos favoritos, remove
      setFavorites(prev => prev.filter(fav => fav.id !== product.id));
      return false; // Retorna false indicando que foi removido
    } else {
      // Se não está nos favoritos, adiciona
      const newFavorite: FavoriteItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        addedAt: new Date()
      };
      
      setFavorites(prev => [newFavorite, ...prev]);
      
      // Mostrar feedback
      setLastAddedFavorite(product);
      setShowAddedFeedback(true);
      setTimeout(() => setShowAddedFeedback(false), 2000);
      
      return true; // Retorna true indicando que foi adicionado
    }
  }, [favorites]);

  const removeFromFavorites = useCallback((productId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== productId));
  }, []);

  const isFavorite = useCallback((productId: number) => {
    return favorites.some(fav => fav.id === productId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    favoriteCount: favorites.length,
    lastAddedFavorite,
    showAddedFeedback,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites
  };
};