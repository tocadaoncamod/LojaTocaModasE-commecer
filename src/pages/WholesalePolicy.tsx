import React from 'react';
import { ArrowLeft, Package, Users, Calculator, Star } from 'lucide-react';

const WholesalePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=60&h=60" 
                alt="Logo Onça" 
                className="w-10 h-10 object-cover rounded-full border-2 border-yellow-400"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Política de Atacado</h1>
                <p className="text-gray-600">Toca da Onça Moda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Vendas no Atacado - Condições Especiais</h2>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <p className="text-purple-800 font-medium">
                📦 <strong>15 Anos no Atacado:</strong> Fornecemos para lojistas e revendedores com as melhores condições do mercado!
              </p>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">1. Quantidades Mínimas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl mb-2">👕</p>
                  <h4 className="font-semibold text-green-900">Camisetas</h4>
                  <p className="text-sm text-green-800">Mínimo: 12 peças</p>
                  <p className="text-xs text-green-700">Mesmo modelo/cores variadas</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl mb-2">👖</p>
                  <h4 className="font-semibold text-blue-900">Calças/Jeans</h4>
                  <p className="text-sm text-blue-800">Mínimo: 6 peças</p>
                  <p className="text-xs text-blue-700">Tamanhos variados</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl mb-2">👗</p>
                  <h4 className="font-semibold text-purple-900">Vestidos</h4>
                  <p className="text-sm text-purple-800">Mínimo: 6 peças</p>
                  <p className="text-xs text-purple-700">Modelos variados</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">2. Descontos Progressivos</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-3">💰 Tabela de Descontos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-yellow-800 mb-2"><strong>Quantidade de Peças:</strong></p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• 12 a 23 peças: <strong>15% de desconto</strong></li>
                        <li>• 24 a 47 peças: <strong>20% de desconto</strong></li>
                        <li>• 48 a 95 peças: <strong>25% de desconto</strong></li>
                        <li>• 96+ peças: <strong>30% de desconto</strong></li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-800 mb-2"><strong>Valor Total:</strong></p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• R$ 500 a R$ 999: <strong>+2% desconto</strong></li>
                        <li>• R$ 1.000 a R$ 1.999: <strong>+3% desconto</strong></li>
                        <li>• R$ 2.000 a R$ 4.999: <strong>+5% desconto</strong></li>
                        <li>• R$ 5.000+: <strong>+7% desconto</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">3. Quem Pode Comprar no Atacado</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🏪 Lojistas</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Proprietários de lojas físicas</li>
                    <li>• Lojas online estabelecidas</li>
                    <li>• Boutiques e ateliês</li>
                    <li>• Feiras e eventos</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">👥 Revendedores</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Vendedores autônomos</li>
                    <li>• Consultoras de moda</li>
                    <li>• Vendas por catálogo</li>
                    <li>• Redes sociais</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Documentação Necessária</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📋 Para Cadastro no Atacado:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-2"><strong>Pessoa Física:</strong></p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• CPF</li>
                      <li>• RG</li>
                      <li>• Comprovante de residência</li>
                      <li>• Comprovante de atividade comercial</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-2"><strong>Pessoa Jurídica:</strong></p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• CNPJ</li>
                      <li>• Inscrição Estadual</li>
                      <li>• Contrato Social</li>
                      <li>• Comprovante de endereço da empresa</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Formas de Pagamento</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">💳 À Vista (Desconto Extra de 3%)</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• PIX (preferencial)</li>
                    <li>• Dinheiro</li>
                    <li>• Cartão de débito</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">💰 Parcelado</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Cartão de crédito: até 3x sem juros</li>
                    <li>• Cartão de crédito: até 6x com juros</li>
                    <li>• Cheque: até 2x (clientes cadastrados)</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🤝 Crediário Próprio</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Para clientes com histórico</li>
                    <li>• Análise de crédito necessária</li>
                    <li>• Condições especiais</li>
                    <li>• Consulte disponibilidade</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Condições Especiais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">🎁 Bônus por Volume</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Compras acima de R$ 1.000: 1 peça grátis</li>
                    <li>• Compras acima de R$ 2.000: 3 peças grátis</li>
                    <li>• Compras acima de R$ 5.000: 5% em produtos</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🔥 Promoções Semanais</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Kits promocionais</li>
                    <li>• Liquidação de estoque</li>
                    <li>• Lançamentos com desconto</li>
                    <li>• Ofertas relâmpago</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Entrega para Atacado</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">🚚 Condições Especiais de Entrega</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>Frete grátis</strong> para compras acima de R$ 500,00 em São Sebastião</li>
                  <li>• <strong>Entrega programada</strong> conforme sua necessidade</li>
                  <li>• <strong>Embalagem reforçada</strong> para transporte seguro</li>
                  <li>• <strong>Nota fiscal</strong> sempre acompanha a mercadoria</li>
                  <li>• <strong>Conferência na entrega</strong> para garantir qualidade</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Suporte ao Lojista</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🎯 Consultoria de Vendas</h4>
                  <p className="text-sm text-green-800">
                    Ajudamos você a escolher os produtos que mais vendem na sua região e público-alvo.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📊 Relatórios de Tendências</h4>
                  <p className="text-sm text-blue-800">
                    Compartilhamos informações sobre produtos em alta e sazonalidade.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">📱 Material de Divulgação</h4>
                  <p className="text-sm text-purple-800">
                    Fornecemos fotos e descrições dos produtos para suas redes sociais.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Como Fazer seu Primeiro Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Entre em Contato</h4>
                    <p className="text-sm text-gray-700">WhatsApp: (12) 99205-8243 - Informe que deseja comprar no atacado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cadastro</h4>
                    <p className="text-sm text-gray-700">Envie sua documentação e faça seu cadastro de atacadista</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Escolha os Produtos</h4>
                    <p className="text-sm text-gray-700">Receba nosso catálogo completo com preços de atacado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Finalize o Pedido</h4>
                    <p className="text-sm text-gray-700">Confirme quantidades, pagamento e entrega</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">10. Contato Atacado</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-800 mb-2">
                  <strong>📞 Central do Atacado:</strong>
                </p>
                <ul className="text-purple-800 space-y-1">
                  <li><strong>WhatsApp Atacado:</strong> (12) 99205-8243</li>
                  <li><strong>E-mail:</strong> tocadaoncamoda@gmail.com</li>
                  <li><strong>Loja:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP</li>
                  <li><strong>Horário:</strong> Segunda a Sábado, 09:30 às 19:00</li>
                  <li><strong>Atendimento:</strong> Especializado para lojistas</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Package className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-semibold text-purple-700">
                  Seu sucesso é o nosso sucesso!
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                © 2024 Toca da Onça Moda - 15 anos fornecendo para lojistas com qualidade e confiança
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalePolicy;