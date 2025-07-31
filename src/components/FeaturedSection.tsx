import React from 'react';

const FeaturedSection: React.FC = () => {
  const featuredItems = [
    {
      id: 1,
        title: "👗 Feminino",
        subtitle: "Até 40% OFF",
      image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600",
        color: "from-yellow-400 to-blue-500"
    },
    {
      id: 2,
        title: "👔 Masculino",
        subtitle: "Novidades",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600",
        color: "from-blue-500 to-yellow-400"
    },
    {
      id: 3,
        title: "🧸 Infantil",
        subtitle: "Coleção Especial",
      image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600",
        color: "from-yellow-500 to-blue-600"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-yellow-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Destaques da Semana
          </h2>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Não perca nossas ofertas especiais e lançamentos exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="relative h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              ></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80`}></div>
              
              <div className="relative h-full flex flex-col justify-center items-center text-white p-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-lg md:text-xl font-medium">
                  {item.subtitle}
                </p>
                <button className="mt-4 bg-[#3483fa] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2968c8] transition-colors">
                  Ver Mais
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;