import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Settings, Music } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/tocadaoncamoda", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/tocadaoncamoda", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/tocadaoncamoda", label: "Twitter" },
    { icon: Music, href: "https://www.tiktok.com/@toca.da.ona.modas?_t=ZM-8yKsub9UY6A&_r=1", label: "TikTok" }
  ];

  const footerLinks = {
    "A Empresa": [
      "15 Anos de Tradição",
      "Atacado e Varejo",
      "Trabalhe Conosco",
      "Nossa Loja Física"
    ],
    "Atendimento": [
      "Central de Ajuda",
      "Trocas e Devoluções",
      "Guia de Tamanhos",
      "WhatsApp: (12) 99205-8243"
    ],
    "Políticas": [
      "Termos de Uso",
      "Política de Privacidade",
      "Política de Trocas",
      "Política de Entrega",
      "Política de Atacado"
    ]
  };

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">
              Toca da Onça Moda
            </h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
            </p>
          <p className="text-blue-100 mb-4 leading-relaxed text-sm">
            <strong>15 anos de tradição</strong> em São Sebastião, SP. Moda masculina, feminina e infantil no atacado e varejo. 
            Qualidade garantida com preços que cabem no seu bolso!
          </p>
          <p className="text-yellow-200 text-sm font-medium mb-6">
            "Se precisa de roupa boa e barata, aqui é o melhor lugar!"
          </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100">(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100">(12) 99205-8243</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100">contato@tocadaonca.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100">tocadaoncamoda@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100">São Paulo, SP</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100 text-sm">Rua Capitão Luiz Soares, 386 - Centro<br />São Sebastião, SP</span>
              </div>
            </div>
            <div className="bg-blue-800 rounded-lg p-3 mt-4">
              <p className="text-yellow-300 font-semibold text-sm mb-1">🕒 Horário de Funcionamento:</p>
              <p className="text-blue-100 text-xs">Segunda a Sábado: 09:30 às 19:00</p>
              <p className="text-blue-100 text-xs">Domingo: Fechado</p>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    {link.includes('WhatsApp') ? (
                      <a
                        href="#"
                        className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                        </svg>
                        {link}
                      </a>
                    ) : link === 'Nossa Loja Física' ? (
                      <div className="space-y-2">
                        <a
                          href="#"
                          className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 block"
                        >
                          {link}
                        </a>
                        <a
                          href="#admin"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.hash = 'admin';
                            window.location.reload();
                          }}
                          className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 text-sm flex items-center gap-2 pl-2"
                        >
                          <Settings className="h-4 w-4" />
                          Admin
                        </a>
                        <a
                          href="#seller"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.hash = 'seller';
                            window.location.reload();
                          }}
                          className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 text-sm flex items-center gap-2 pl-2"
                        >
                          <Settings className="h-4 w-4" />
                          Vendedor
                        </a>
                      </div>
                    ) : (
                      <a
                        href="#"
                        className="text-blue-100 hover:text-yellow-300 transition-colors duration-300"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {category === "Sobre Nós" && (
                <div className="mt-4">
                  <a
                    href="#supabase-test"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = 'supabase-test';
                      window.location.reload();
                    }}
                    className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 text-sm flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Teste Supabase
                  </a>
                </div>
              )}
            </div>
          ))}
          
          {/* Marketplace Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://shopee.com.br/tocadaoncamoda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2"
                >
                  🛒 Loja Oficial na Shopee
                </a>
              </li>
              <li>
                <a
                  href="https://tocadaoncaroupa.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2"
                >
                  🌐 Site Oficial
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-center md:text-left">
              © 2024 Toca da Onça Moda - 15 anos vestindo famílias com estilo. Todos os direitos reservados.
            </p>
            
            {/* Admin Button */}
            <div className="flex items-center gap-4">
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="p-2 bg-[#3483fa] rounded-full hover:bg-[#2968c8] transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </a>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;