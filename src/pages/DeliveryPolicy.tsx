import React from 'react';
import { ArrowLeft, Truck, MapPin, Clock, Package } from 'lucide-react';

const DeliveryPolicy: React.FC = () => {
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
                <h1 className="text-2xl font-bold text-gray-900">Política de Entrega</h1>
                <p className="text-gray-600">Toca da Onça Moda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="flex items-center gap-2 mb-6">
              <Truck className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Política de Entrega e Retirada</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 font-medium">
                🚚 <strong>Entrega Rápida e Segura:</strong> Levamos seus produtos com agilidade e cuidado em São Sebastião e região!
              </p>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">1. Áreas de Entrega</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Entrega Gratuita</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Centro de São Sebastião</li>
                    <li>• Bairros próximos à loja</li>
                    <li>• Compras acima de R$ 100,00</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🚚 Entrega com Taxa</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Demais bairros de São Sebastião</li>
                    <li>• Cidades vizinhas</li>
                    <li>• Taxa calculada por distância</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">2. Prazos de Entrega</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">⚡ Entrega Expressa</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Centro de São Sebastião:</strong> Mesmo dia (pedidos até 15h)</li>
                    <li>• <strong>Bairros próximos:</strong> Até 24 horas</li>
                    <li>• <strong>Taxa adicional:</strong> R$ 10,00</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🚚 Entrega Normal</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>São Sebastião:</strong> 1 a 2 dias úteis</li>
                    <li>• <strong>Cidades vizinhas:</strong> 2 a 3 dias úteis</li>
                    <li>• <strong>Região:</strong> 3 a 5 dias úteis</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">3. Retirada na Loja</h3>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-3">🏪 Retire Gratuitamente na Nossa Loja</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-orange-800 mb-2"><strong>📍 Endereço:</strong></p>
                    <p className="text-sm text-orange-800">Rua Capitão Luiz Soares, 386<br />Centro, São Sebastião, SP</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-800 mb-2"><strong>🕒 Horário:</strong></p>
                    <p className="text-sm text-orange-800">Segunda a Sábado: 09:30 às 19:00<br />Domingo: Fechado</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-orange-100 rounded">
                  <p className="text-xs text-orange-800">
                    <strong>💡 Dica:</strong> Produtos ficam reservados por até 3 dias. Leve documento com foto para retirada.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Cálculo do Frete</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Como Calculamos:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Distância:</strong> Quilometragem da loja até o destino</li>
                  <li>• <strong>Peso:</strong> Quantidade de produtos</li>
                  <li>• <strong>Urgência:</strong> Entrega normal ou expressa</li>
                  <li>• <strong>Valor mínimo:</strong> R$ 5,00 para entregas locais</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-2xl mb-2">🏠</p>
                  <p className="font-semibold text-gray-900">Centro</p>
                  <p className="text-sm text-gray-600">Grátis*</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-2xl mb-2">🏘️</p>
                  <p className="font-semibold text-gray-900">Bairros</p>
                  <p className="text-sm text-gray-600">R$ 5,00 - R$ 15,00</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-2xl mb-2">🌆</p>
                  <p className="font-semibold text-gray-900">Região</p>
                  <p className="text-sm text-gray-600">R$ 15,00 - R$ 30,00</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                *Frete grátis para compras acima de R$ 100,00
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Processo de Entrega</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Confirmação do Pedido</h4>
                    <p className="text-sm text-blue-800">Confirmamos seu pedido via WhatsApp com todos os detalhes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-green-900">Preparação</h4>
                    <p className="text-sm text-green-800">Separamos e embalamos seus produtos com cuidado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Saída para Entrega</h4>
                    <p className="text-sm text-purple-800">Enviamos mensagem informando que o produto saiu para entrega</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-yellow-900">Entrega</h4>
                    <p className="text-sm text-yellow-800">Entregamos no endereço informado e confirmamos o recebimento</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Responsabilidades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🏪 Nossa Responsabilidade</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Embalar produtos adequadamente</li>
                    <li>• Cumprir prazos informados</li>
                    <li>• Comunicar atrasos ou problemas</li>
                    <li>• Entregar no endereço correto</li>
                    <li>• Produtos em perfeito estado</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">👤 Sua Responsabilidade</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Fornecer endereço completo e correto</li>
                    <li>• Estar disponível no horário combinado</li>
                    <li>• Conferir produtos no recebimento</li>
                    <li>• Informar problemas imediatamente</li>
                    <li>• Ter documento para retirada na loja</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Situações Especiais</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Endereço Não Localizado</h4>
                  <p className="text-sm text-yellow-800">
                    Entraremos em contato para confirmar o endereço. Taxa adicional pode ser cobrada para nova tentativa.
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">❌ Cliente Ausente</h4>
                  <p className="text-sm text-red-800">
                    Faremos até 2 tentativas de entrega. Após isso, produto retorna à loja e nova entrega será cobrada.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🌧️ Condições Climáticas</h4>
                  <p className="text-sm text-purple-800">
                    Em caso de chuva forte ou condições adversas, entregas podem ser reagendadas para segurança.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Acompanhe seu Pedido</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  <strong>📱 Acompanhamento via WhatsApp:</strong>
                </p>
                <ul className="text-gray-700 space-y-1">
                  <li>• <strong>WhatsApp:</strong> (12) 99205-8243</li>
                  <li>• <strong>Status:</strong> Pedido confirmado → Em preparação → Saiu para entrega → Entregue</li>
                  <li>• <strong>Horário:</strong> Atualizações durante horário comercial</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Contato para Entregas</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-2">
                  <strong>📞 Central de Entregas:</strong>
                </p>
                <ul className="text-blue-800 space-y-1">
                  <li><strong>WhatsApp:</strong> (12) 99205-8243</li>
                  <li><strong>E-mail:</strong> tocadaoncamoda@gmail.com</li>
                  <li><strong>Loja:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP</li>
                  <li><strong>Horário:</strong> Segunda a Sábado, 09:30 às 19:00</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-700">
                  Entregamos com carinho e rapidez!
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                © 2024 Toca da Onça Moda - Política de Entrega transparente e eficiente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPolicy;