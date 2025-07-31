import React from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

const ExchangePolicy: React.FC = () => {
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
                <h1 className="text-2xl font-bold text-gray-900">Política de Trocas</h1>
                <p className="text-gray-600">Toca da Onça Moda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="flex items-center gap-2 mb-6">
              <RotateCcw className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Política de Trocas e Devoluções</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 font-medium">
                🛡️ <strong>Garantia de Satisfação:</strong> Sua satisfação é nossa prioridade! Oferecemos condições justas e transparentes para trocas.
              </p>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">1. Prazo para Trocas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Compras na Loja Física</h4>
                  <p className="text-sm text-green-800">
                    <strong>7 dias corridos</strong> a partir da data da compra
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📱 Compras Online</h4>
                  <p className="text-sm text-blue-800">
                    <strong>7 dias corridos</strong> a partir do recebimento do produto
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">2. Condições para Troca</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Produtos Aceitos para Troca:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Produto em perfeito estado de conservação</li>
                  <li>• Com etiquetas originais anexadas</li>
                  <li>• Sem sinais de uso, lavagem ou alterações</li>
                  <li>• Acompanhado da nota fiscal ou comprovante</li>
                  <li>• Embalagem original (quando aplicável)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">3. Produtos Não Aceitos</h3>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">❌ Não Aceitamos Trocas de:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Roupas íntimas (calcinhas, sutiãs, cuecas)</li>
                  <li>• Produtos personalizados ou sob medida</li>
                  <li>• Itens com sinais de uso ou lavagem</li>
                  <li>• Produtos danificados pelo cliente</li>
                  <li>• Itens sem etiqueta ou com etiqueta danificada</li>
                  <li>• Produtos em promoção ou liquidação (consultar condições)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Como Fazer a Troca</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">🏪 Na Loja Física</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>Endereço:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP</li>
                    <li><strong>Horário:</strong> Segunda a Sábado, 09:30 às 19:00</li>
                    <li><strong>Documentos:</strong> Leve o produto, nota fiscal e documento</li>
                    <li><strong>Processo:</strong> Troca imediata (sujeita a disponibilidade)</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">📱 Via WhatsApp</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>WhatsApp:</strong> (12) 99205-8243</li>
                    <li><strong>Envie:</strong> Foto do produto e nota fiscal</li>
                    <li><strong>Processo:</strong> Análise em até 24h</li>
                    <li><strong>Coleta:</strong> Agendamos retirada (se necessário)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Tipos de Troca Disponíveis</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔄 Troca por Outro Produto</h4>
                  <p className="text-sm text-blue-800">
                    Escolha outro produto de valor igual ou superior (pagando a diferença)
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">📏 Troca de Tamanho</h4>
                  <p className="text-sm text-purple-800">
                    Mesmo produto em tamanho diferente (sujeito a disponibilidade)
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">💰 Crédito na Loja</h4>
                  <p className="text-sm text-green-800">
                    Valor convertido em crédito para compras futuras (válido por 90 dias)
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Produtos com Defeito</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Defeitos de Fabricação</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Prazo estendido: até 30 dias para reclamação</li>
                  <li>• Troca imediata ou reembolso integral</li>
                  <li>• Não há cobrança de frete para devolução</li>
                  <li>• Entre em contato imediatamente pelo WhatsApp</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Custos de Troca</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Sem Custo</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Troca na loja física</li>
                    <li>• Produtos com defeito</li>
                    <li>• Erro no envio</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">💰 Com Custo</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Frete para devolução online</li>
                    <li>• Coleta em domicílio</li>
                    <li>• Nova entrega (se aplicável)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Dicas Importantes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li>📏 <strong>Consulte a tabela de medidas</strong> antes de comprar</li>
                  <li>📱 <strong>Entre em contato</strong> pelo WhatsApp para dúvidas</li>
                  <li>🏷️ <strong>Mantenha as etiquetas</strong> até ter certeza do produto</li>
                  <li>📋 <strong>Guarde a nota fiscal</strong> - é obrigatória para trocas</li>
                  <li>⏰ <strong>Não deixe para o último dia</strong> - processe a troca com antecedência</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Contato para Trocas</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 mb-2">
                  <strong>📞 Central de Trocas:</strong>
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
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-700">
                  Sua satisfação é nossa garantia!
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                © 2024 Toca da Onça Moda - Política de Trocas transparente e justa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePolicy;