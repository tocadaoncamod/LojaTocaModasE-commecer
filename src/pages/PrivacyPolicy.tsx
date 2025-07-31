import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
                <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
                <p className="text-gray-600">Toca da Onça Moda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Política de Privacidade e Proteção de Dados</h2>
            </div>

            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> Janeiro de 2024
            </p>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Compromisso com sua Privacidade</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Toca da Onça Moda respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta política explica como coletamos, usamos e protegemos suas informações.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Nossa Promessa:</strong> Seus dados são tratados com máxima segurança e transparência, em conformidade com a LGPD (Lei Geral de Proteção de Dados).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">2. Dados que Coletamos</h3>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">Dados Fornecidos por Você:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Nome completo</li>
                <li>Telefone/WhatsApp</li>
                <li>Endereço de entrega</li>
                <li>E-mail (quando fornecido)</li>
                <li>Preferências de produtos</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">Dados Coletados Automaticamente:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Informações de navegação no site</li>
                <li>Endereço IP</li>
                <li>Tipo de dispositivo e navegador</li>
                <li>Páginas visitadas e tempo de permanência</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">3. Como Usamos seus Dados</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Processar Pedidos:</strong> Para confirmar, processar e entregar suas compras</li>
                <li><strong>Comunicação:</strong> Para enviar confirmações, atualizações e suporte via WhatsApp</li>
                <li><strong>Melhorar Serviços:</strong> Para personalizar sua experiência e melhorar nossos produtos</li>
                <li><strong>Marketing:</strong> Para enviar ofertas e novidades (apenas com seu consentimento)</li>
                <li><strong>Segurança:</strong> Para prevenir fraudes e garantir a segurança das transações</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 m-0">4. Proteção dos seus Dados</h3>
              </div>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-red-800">
                  <strong>Segurança Máxima:</strong> Utilizamos criptografia SSL e medidas de segurança avançadas para proteger suas informações.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Acesso restrito apenas a funcionários autorizados</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups seguros e regulares</li>
                <li>Treinamento da equipe em proteção de dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Compartilhamento de Dados</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Não vendemos seus dados!</strong> Compartilhamos informações apenas quando necessário:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Prestadores de Serviço:</strong> Transportadoras para entrega</li>
                <li><strong>Processamento de Pagamentos:</strong> Instituições financeiras para transações</li>
                <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou autoridades</li>
                <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Você tem direito a:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Confirmar se tratamos seus dados</li>
                    <li>• Acessar seus dados</li>
                    <li>• Corrigir dados incompletos</li>
                    <li>• Solicitar exclusão de dados</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Também pode:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Revogar consentimento</li>
                    <li>• Solicitar portabilidade</li>
                    <li>• Opor-se ao tratamento</li>
                    <li>• Informações sobre compartilhamento</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Cookies e Tecnologias</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos cookies para melhorar sua experiência de navegação:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Necessários para funcionamento do site</li>
                <li><strong>Cookies de Preferência:</strong> Lembram suas escolhas e configurações</li>
                <li><strong>Cookies Analíticos:</strong> Ajudam a entender como você usa o site</li>
                <li><strong>Cookies de Marketing:</strong> Personalizam anúncios (com seu consentimento)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Retenção de Dados</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Dados de Compra:</strong> Mantidos por 5 anos (obrigação fiscal)</li>
                <li><strong>Dados de Navegação:</strong> Mantidos por até 2 anos</li>
                <li><strong>Marketing:</strong> Até você revogar o consentimento</li>
                <li><strong>Suporte:</strong> Mantidos enquanto necessário para atendimento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Menores de Idade</h3>
              <p className="text-gray-700 leading-relaxed">
                Não coletamos intencionalmente dados de menores de 18 anos sem consentimento dos pais ou responsáveis. Se você é menor de idade, peça para um responsável fazer a compra.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">10. Alterações nesta Política</h3>
              <p className="text-gray-700 leading-relaxed">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas via WhatsApp ou e-mail.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">11. Contato - Encarregado de Dados</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
                </p>
                <ul className="text-gray-700 space-y-1">
                  <li><strong>WhatsApp:</strong> (12) 99205-8243</li>
                  <li><strong>E-mail:</strong> tocadaoncamoda@gmail.com</li>
                  <li><strong>Endereço:</strong> Rua Capitão Luiz Soares, 386 – Centro, São Sebastião, SP</li>
                  <li><strong>Horário:</strong> Segunda a Sábado, 09:30 às 19:00</li>
                </ul>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Seus dados estão seguros conosco!
                </p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                © 2024 Toca da Onça Moda - Política de Privacidade em conformidade com a LGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;