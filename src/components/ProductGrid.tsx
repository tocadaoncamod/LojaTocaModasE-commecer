import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, Share2, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CategorySidebar from './CategorySidebar';
import ProductDetailModal from './ProductDetailModal';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  description?: string;
  stock?: number;
  images?: string[];
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => boolean;
  isFavorite: (productId: number) => boolean;
  searchTerm?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart, onToggleFavorite, isFavorite, searchTerm: externalSearchTerm }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<number | null>(null);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadRealProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('🔍 Carregando produtos...');

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('❌ Erro ao carregar produtos:', productsError);
        setDebugInfo(`❌ Erro: ${productsError.message}`);
        throw productsError;
      }

      const productIds = productsData.map(p => p.id);
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('display_order', { ascending: true });

      const imagesMap = new Map<number, string[]>();
      if (imagesData) {
        imagesData.forEach(img => {
          if (!imagesMap.has(img.product_id)) {
            imagesMap.set(img.product_id, []);
          }
          imagesMap.get(img.product_id)!.push(img.image_url);
        });
      }

      const finalProducts: Product[] = productsData.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        oldPrice: item.old_price ? parseFloat(item.old_price) : undefined,
        imageUrl: item.image_url,
        category: item.category || 'Geral',
        description: item.description,
        stock: item.stock,
        images: imagesMap.get(item.id) || []
      }));

      setProducts(finalProducts);
      setDebugInfo(`✅ ${finalProducts.length} produtos carregados com sucesso`);

    } catch (err) {
      console.error('❌ Erro ao carregar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      setDebugInfo(`❌ Erro: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadRealProducts();
  }, [loadRealProducts]);

  // Use external search term if provided, otherwise use internal
  const activeSearchTerm = externalSearchTerm || internalSearchTerm;

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const headerHeight = 128; // Height of sticky header
        
        // Check if section is in view and has enough content below
        const shouldBeSticky = sectionRect.top <= headerHeight && sectionRect.bottom > headerHeight + 200;
        setIsSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !activeSearchTerm || 
      product.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(activeSearchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get unique categories from products
  const availableCategories = ['all', ...new Set(products.map(p => p.category))].filter(Boolean).sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return a.localeCompare(b);
  });

  const handleShare = async (product: Product, platform?: 'facebook' | 'instagram' | 'whatsapp') => {
    const productUrl = `${window.location.origin}?product=${product.id}`;
    const shareText = `Confira este produto incrível da Toca da Onça: ${product.name} por apenas ${formatPrice(product.price)}!`;
    
    if (platform) {
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'instagram':
          // Instagram não suporta compartilhamento direto via URL, então usamos o navigator.share
          if (navigator.share) {
            try {
              await navigator.share({
                title: product.name,
                text: shareText,
                url: productUrl
              });
              setShowShareMenu(null);
              return;
            } catch (error) {
              console.log('Compartilhamento cancelado');
            }
          } else {
            alert('Copie o link e compartilhe no Instagram: ' + productUrl);
          }
          setShowShareMenu(null);
          return;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } else {
      // Usar API nativa do navegador
      if (navigator.share) {
        try {
          await navigator.share({
            title: product.name,
            text: shareText,
            url: productUrl
          });
        } catch (error) {
          console.log('Compartilhamento cancelado');
        }
      } else {
        // Fallback: copiar para clipboard
        try {
          await navigator.clipboard.writeText(shareText + ' ' + productUrl);
          alert('Link copiado para a área de transferência!');
        } catch (error) {
          alert('Link do produto: ' + productUrl);
        }
      }
    }
    
    setShowShareMenu(null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <>
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            {activeSearchTerm 
              ? `Resultados para: "${activeSearchTerm}"` 
              : selectedCategory === 'all' 
                ? 'Todos os Produtos' 
                : `Categoria: ${selectedCategory}`
            }
          </h2>
          <p className="text-base md:text-lg text-blue-700 max-w-2xl mx-auto px-4">
            {activeSearchTerm 
              ? `${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`
              : 'Descubra nossa seleção especial com os melhores preços e qualidade da Toca da Onça'
            }
          </p>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-gray-600 text-xs mt-2">{debugInfo}</p>
              <button
                onClick={loadRealProducts}
                className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {/* DEBUG INFO */}
          {debugInfo && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm font-mono">{debugInfo}</p>
            </div>
          )}
          
          {/* Clear search button */}
          {activeSearchTerm && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setInternalSearchTerm('');
                  // If using external search, we can't clear it from here
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full transition-colors text-sm"
              >
                ✕ Limpar busca
              </button>
            </div>
          )}
          
          {/* Mobile category button */}
          <button
            className="lg:hidden mt-6 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-6 rounded-full transition-colors shadow-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            📂 Filtrar Categorias
          </button>
          
          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
             availableCategories={availableCategories}
              products={products}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56">
          <div 
            ref={sidebarRef}
            className={`w-56 transition-all duration-200 ${
              isSticky 
                ? 'fixed top-20 z-30' 
                : 'relative'
            }`}
          >
          <CategorySidebar
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
           availableCategories={availableCategories}
            products={products}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-200"></div>
                <div className="p-3 md:p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐆</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeSearchTerm 
                ? `Nenhum produto encontrado para "${activeSearchTerm}"`
                : selectedCategory === 'all' 
                  ? 'Nenhum produto encontrado' 
                  : `Nenhum produto na categoria "${selectedCategory}"`
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {activeSearchTerm
                ? 'Tente buscar por outros termos ou navegue pelas categorias'
                : selectedCategory === 'all' 
                  ? 'Nossos produtos estão sendo carregados...' 
                  : 'Tente selecionar outra categoria'
              }
            </p>
            {(selectedCategory !== 'all' || activeSearchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setInternalSearchTerm('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Ver Todos os Produtos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
              <div className="relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400') {
                      target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }
                  }}
                  loading="lazy"
                />

                {product.images && product.images.length > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    📷 {product.images.length} {product.images.length === 1 ? 'foto' : 'fotos'}
                  </div>
                )}
                
                {/* Discount badge */}
                {product.oldPrice && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                  </div>
                )}
                
                {/* Favorite button */}
                <button 
                  onClick={() => onToggleFavorite(product)}
                  className={`hidden md:block absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isFavorite(product.id) 
                      ? 'bg-red-50 hover:bg-red-100' 
                      : 'hover:bg-red-50'
                  }`}
                  title={isFavorite(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart className={`h-4 w-4 transition-colors ${
                    isFavorite(product.id) 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`} />
                </button>
                
                {/* Share button */}
                <div className="absolute top-3 right-14 md:right-16">
                  <button 
                    onClick={() => setShowShareMenu(showShareMenu === product.id ? null : product.id)}
                    className="p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-50"
                  >
                    <Share2 className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                  </button>
                  
                  {/* Share menu */}
                  {showShareMenu === product.id && (
                    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[160px]">
                      <button
                        onClick={() => handleShare(product)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartilhar
                      </button>
                      <button
                        onClick={() => handleShare(product, 'whatsapp')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare(product, 'facebook')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare(product, 'instagram')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                      >
                        <Instagram className="h-4 w-4 text-pink-600" />
                        Instagram
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 md:p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <span className="text-xs text-blue-700 font-medium bg-yellow-100 px-2 py-1 rounded-full hidden sm:inline">
                    {product.category}
                  </span>
                </div>

                <h3
                  className="font-semibold text-gray-900 mb-3 text-sm md:text-base leading-tight min-h-[2.5rem] md:min-h-[3rem] flex items-start cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-lg md:text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs md:text-sm text-gray-500 line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-3 md:py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 group text-sm md:text-base mt-auto"
                >
                  <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="text-center mt-12">
          <button className="bg-[#3483fa] hover:bg-[#2968c8] text-white font-semibold py-4 px-8 rounded-full transition-colors duration-300">
            Carregar Mais Produtos
          </button>
        </div>
        )}
        </div>
        </div>
      </div>
    </section>

    {selectedProduct && (
      <ProductDetailModal
        product={selectedProduct}
        onClose={handleCloseModal}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite(selectedProduct.id)}
      />
    )}
    </>
  );
};

export default ProductGrid;