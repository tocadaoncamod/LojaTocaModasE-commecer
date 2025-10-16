import React from 'react';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import FeaturedSection from '../components/FeaturedSection';
import ProductGrid from '../components/ProductGrid';
import BenefitsSection from '../components/BenefitsSection';
import ProductDetailModal from '../components/ProductDetailModal';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';

interface HomeProps {
  globalSearchTerm?: string;
}

const Home: React.FC<HomeProps> = ({ globalSearchTerm = '' }) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { addToCart, lastAddedProduct, showAddedFeedback } = useCart();
  const { addToFavorites, isFavorite, removeFromFavorites } = useFavorites();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleToggleFavorite = (productId: number) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites({ id: productId } as any);
    }
  };

  return (
    <div>
      {lastAddedProduct && showAddedFeedback && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
          <p className="font-semibold">{lastAddedProduct.name}</p>
          <p className="text-sm">Adicionado ao carrinho!</p>
        </div>
      )}

      <HeroSection />
      <FeaturedSection onViewProduct={setSelectedProduct} />
      <ProductGrid
        onViewProduct={setSelectedProduct}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
        searchTerm={globalSearchTerm}
      />
      <BenefitsSection />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite(selectedProduct.id)}
        />
      )}
    </div>
  );
};

export default Home;
