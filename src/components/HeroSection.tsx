import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-yellow-400 to-blue-600 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div 
        className="relative min-h-[400px] md:min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight flex items-center gap-4 justify-center lg:justify-start">
              <img 
                src="https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=100&h=100" 
                alt="Logo Onça" 
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-yellow-300 shadow-lg"
              />
              <div className="flex flex-col">
                <span className="text-yellow-300">Toca da Onça Moda</span>
                <span className="text-2xl md:text-3xl">Estilo para Toda Família</span>
                <span className="text-lg md:text-xl text-blue-200 font-normal">Atacado & Varejo</span>
              </div>
            </h1>
            <p className="text-lg md:text-xl mb-4 text-gray-200 leading-relaxed">
              <strong>15 anos de tradição</strong> em São Sebastião, SP. Moda masculina, feminina e infantil com qualidade garantida e preços que cabem no seu bolso.
            </p>
            <p className="text-base md:text-lg mb-8 text-yellow-200 font-medium italic">
              "Se precisa de roupa boa e barata, aqui é o melhor lugar!"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => {
                  const productsSection = document.querySelector('#products-section');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Ver Catálogo Completo
              </button>
              <button 
                onClick={() => {
                  const phoneNumber = '5512992058243';
                  const message = encodeURIComponent('Olá! Gostaria de saber mais sobre as ofertas de atacado da Toca da Onça Moda. Podem me enviar o catálogo com preços especiais?');
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-transparent border-2 border-white hover:bg-[#3483fa] hover:text-white text-white font-bold py-4 px-8 rounded-full transition-all duration-300"
              >
                Ofertas de Atacado
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;