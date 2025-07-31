import React from 'react';
import { Truck, RotateCcw, Shield, Clock } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Entregamos em São Sebastião e região com agilidade",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: RotateCcw,
      title: "Troca Garantida",
      description: "7 dias para trocar na loja física ou online",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Shield,
      title: "15 Anos de Tradição",
      description: "Qualidade garantida e confiança conquistada",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Clock,
      title: "Horário Estendido",
      description: "Segunda a Sábado das 09:30 às 19:00",
      color: "text-amber-600 bg-amber-100"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-3">
            <img 
              src="https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=60&h=60" 
              alt="Logo Onça" 
              className="w-12 h-12 object-cover rounded-full border-2 border-yellow-400"
            />
            Por que Escolher a Toca da Onça Moda?
          </h2>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            15 anos de tradição oferecendo qualidade garantida e preços que cabem no seu bolso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`inline-flex p-4 rounded-full ${benefit.color} mb-4`}>
                  <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-blue-700 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;