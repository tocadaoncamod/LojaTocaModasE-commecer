import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Heart, Zap } from 'lucide-react';

interface ProductDetailModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    imageUrl: string;
    category: string;
    description?: string;
    stock?: number;
    images?: string[];
  };
  onClose: () => void;
  onAddToCart: (product: any) => void;
  onToggleFavorite: (productId: number) => void;
  isFavorite: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite
}) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBuyNow = () => {
    onAddToCart(product);
    onClose();
    navigate('/checkout');
  };

  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl];

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
              <img
                src={allImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-2">
                {product.category}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    R$ {product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {discount > 0 && (
                <p className="text-green-600 font-medium">
                  Economize R$ {(product.oldPrice! - product.price).toFixed(2)} ({discount}% de desconto)
                </p>
              )}
            </div>

            {product.stock !== undefined && (
              <div className={`text-sm font-medium ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? (
                  <span>✓ Em estoque ({product.stock} unidades disponíveis)</span>
                ) : (
                  <span>✗ Produto esgotado</span>
                )}
              </div>
            )}

            {product.description && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descrição do Produto
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="border-t pt-6 space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg shadow-lg"
              >
                <Zap className="h-6 w-6" />
                Comprar Agora
              </button>

              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
              </button>

              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border-2 ${
                  isFavorite
                    ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
              <p>✓ Frete grátis para compras acima de R$ 200,00</p>
              <p>✓ Devolução grátis em até 30 dias</p>
              <p>✓ Garantia de qualidade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
