import React from 'react';

interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

interface CategorySidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  availableCategories: string[];
  products: Array<{ category: string }>;
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
  availableCategories,
  products,
  isOpen,
  onClose
}) => {
  // Mapeamento de emojis baseado nos produtos REAIS do Supabase
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'all': '🛍️',
      // Categorias dos produtos reais
      'Calças': '👖',
      'Calça': '👖',
      'Cargo': '👖',
      'Camisas': '👔',
      'Camisa': '👔',
      'Social': '👔',
      'Camisetas': '👕',
      'Camiseta': '👕',
      'Básica': '👕',
      'Básico': '👕',
      'Jaquetas': '🧥',
      'Jaqueta': '🧥',
      'Jeans': '👖',
      'Óculos': '🕶️',
      'Oculos': '🕶️',
      'Acessórios': '👜',
      'Acessorio': '👜',
      'Casual': '👕',
      'Esporte': '⚽',
      'Fitness': '🏃‍♀️',
      'Inverno': '🧥',
      'Verão': '☀️',
      'Verao': '☀️',
      'Praia': '🏖️',
      'Festa': '🎉',
      'Trabalho': '💼',
      'Escola': '🎒',
      'Casa': '🏠',
      'Sapatos': '👟',
      'Tenis': '👟',
      'Sandalia': '👡',
      'Bota': '👢',
      'Chinelo': '🩴',
      'Bone': '🧢',
      'Chapeu': '👒',
      'Bolsa': '👜',
      'Mochila': '🎒',
      'Carteira': '👛',
      'Cinto': '👔',
      'Relogio': '⌚',
      'Colar': '📿',
      'Pulseira': '💍',
      'Brinco': '💎',
      'Anel': '💍',
      'Feminino': '👗',
      'Masculino': '👔', 
      'Infantil': '🧸',
      'Geral': '📦'
    };
    return emojiMap[category] || '📦';
  };

  const getCategoryName = (category: string): string => {
    return category === 'all' ? 'Todos os Produtos' : category;
  };

  const getCategoryCount = (category: string): number => {
    if (category === 'all') {
      return products.length;
    }
    return products.filter(product => product.category === category).length;
  };

  const categories: Category[] = availableCategories.map(category => ({
    id: category,
    name: getCategoryName(category),
    emoji: getCategoryEmoji(category),
    count: getCategoryCount(category)
  }));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static top-0 left-0 h-screen lg:h-auto
        w-72 sm:w-56 bg-white shadow-lg z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none lg:shadow-md lg:bg-gradient-to-b lg:from-amber-50 lg:to-orange-50 lg:rounded-xl
        lg:transform-none lg:shadow-md lg:bg-gradient-to-b lg:from-yellow-50 lg:to-blue-50 lg:rounded-xl
        border-r border-yellow-300
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 lg:justify-start">
            <h3 className="text-lg md:text-xl font-bold text-black flex items-center gap-2">
              <span className="text-xl">🐆</span>
              Categorias
            </h3>
            <button 
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
          
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategorySelect(category.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left
                  transition-all duration-200 group
                  ${selectedCategory === category.id
                    ? 'bg-[#FEE600] text-black shadow-md font-bold'
                    : 'hover:bg-yellow-100 text-black hover:text-gray-800'
                  }
                `}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {category.emoji}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className={`
                    ml-2 text-xs px-2 py-1 rounded-full
                    ${selectedCategory === category.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-yellow-200 text-black'
                    }
                  `}>
                    {category.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white shadow-lg">
            <div className="text-center">
              <span className="text-2xl block mb-1">🔥</span>
              <h4 className="font-bold text-sm mb-1">Ofertas Especiais</h4>
              <p className="text-xs opacity-95 leading-relaxed font-medium">Até 50% OFF em produtos selecionados</p>
              <div className="mt-1 bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold inline-block">
                APROVEITE!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySidebar;