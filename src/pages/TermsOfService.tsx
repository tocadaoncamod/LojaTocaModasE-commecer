import React from 'react';
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
                <h1 className="text-2xl font-bold text-gray-900">Termos de Uso</h1>
                <p className="text-gray-600">Toca da Onça Moda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Termos e Condições de Uso</h2>
            </div>

            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> Janeiro de 2024
            </p>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Sobre a Toca da Onça Moda</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Toca da Onça Moda é uma empresa com 15 anos de tradição em São Sebastião, SP, especializada em moda masculina, feminina e infantil, atuando no atacado e varejo.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Endereço:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP<br />
                  <strong>WhatsApp:</strong> (12) 99205-8243<br />
                  <strong>E-mail:</strong> tocadaoncamoda@gmail.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Aceitação dos Termos</h3>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar nosso site, aplicativo ou serviços, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Produtos e Preços</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Todos os preços estão em Reais (R$) e podem sofrer alterações sem aviso prévio</li>
                <li>Oferecemos produtos no atacado e varejo com condições diferenciadas</li>
                <li>As imagens dos produtos são meramente ilustrativas</li>
                <li>Nos reservamos o direito de limitar quantidades de compra</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Pedidos e Pagamentos</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Todos os pedidos estão sujeitos à confirmação de disponibilidade</li>
                <li>Aceitamos pagamentos via PIX, cartão de crédito/débito e dinheiro</li>
                <li>Para compras no atacado, consulte condições especiais</li>
                <li>Pedidos online são processados via WhatsApp</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Entrega e Retirada</h3>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Horário de Funcionamento:</strong><br />
                  Segunda a Sábado: 09:30 às 19:00<br />
                  Domingo: Fechado
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Entregamos em São Sebastião e região</li>
                <li>Retirada na loja física disponível no horário de funcionamento</li>
                <li>Prazo de entrega varia conforme localização</li>
                <li>Frete calculado conforme distância e peso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Trocas e Devoluções</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Prazo de 7 dias para trocas a partir da data da compra</li>
                <li>Produtos devem estar em perfeito estado, com etiquetas</li>
                <li>Trocas podem ser feitas na loja física ou via WhatsApp</li>
                <li>Não aceitamos trocas de produtos íntimos ou personalizados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Responsabilidades do Cliente</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Conferir dados do pedido antes da confirmação</li>
                <li>Estar disponível no endereço de entrega</li>
                <li>Tratar nossa equipe com respeito e cordialidade</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h3>
              <p className="text-gray-700 leading-relaxed">
                A Toca da Onça Moda não se responsabiliza por danos indiretos, lucros cessantes ou prejuízos decorrentes do uso de nossos produtos ou serviços, exceto nos casos previstos em lei.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Propriedade Intelectual</h3>
              <p className="text-gray-700 leading-relaxed">
                Todos os conteúdos deste site, incluindo textos, imagens, logos e design, são propriedade da Toca da Onça Moda e protegidos por direitos autorais.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">10. Alterações nos Termos</h3>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">11. Contato</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Para dúvidas sobre estes termos, entre em contato conosco:
                </p>
                <ul className="mt-2 text-gray-700">
                  <li><strong>WhatsApp:</strong> (12) 99205-8243</li>
                  <li><strong>E-mail:</strong> tocadaoncamoda@gmail.com</li>
                  <li><strong>Endereço:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                © 2024 Toca da Onça Moda - 15 anos vestindo famílias com estilo. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;