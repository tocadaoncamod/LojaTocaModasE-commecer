import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Youtube, MessageCircle, Link, Send, Calendar, BarChart, Users } from 'lucide-react';
import { instagramService } from '../../services/social/instagramService';
import { facebookService } from '../../services/social/facebookService';
import { youtubeService } from '../../services/social/youtubeService';
import { whatsappService } from '../../services/social/whatsappService';
import { supabase } from '../../lib/supabase';

const SocialMediaPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'youtube' | 'whatsapp'>('instagram');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadAccounts();
    loadProducts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await supabase
        .from('social_media_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, category, price, image_url')
        .eq('status', 'active')
        .limit(50);

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const getCurrentAccount = () => {
    return accounts.find(acc => acc.platform === activeTab);
  };

  const handleSyncProducts = async () => {
    const account = getCurrentAccount();
    if (!account) {
      alert('Conecte sua conta primeiro!');
      return;
    }

    setLoading(true);
    try {
      let result;

      if (activeTab === 'instagram') {
        result = await instagramService.syncAllProducts(account.id);
      } else if (activeTab === 'facebook') {
        result = await facebookService.syncAllProducts(account.id);
      }

      setResult(result);
      alert(`Sincronização concluída! ${result.success} sucessos, ${result.failed} falhas`);
    } catch (error) {
      console.error('Error syncing products:', error);
      alert('Erro ao sincronizar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideos = async () => {
    const account = getCurrentAccount();
    if (!account) {
      alert('Conecte sua conta primeiro!');
      return;
    }

    setLoading(true);
    try {
      const productIds = selectedProducts.length > 0
        ? selectedProducts
        : products.slice(0, 5).map(p => p.id);

      const result = await youtubeService.batchGenerateVideos(productIds, account.id);
      setResult(result);
      alert(`Vídeos gerados! ${result.success} sucessos, ${result.failed} falhas`);
    } catch (error) {
      console.error('Error generating videos:', error);
      alert('Erro ao gerar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (platform: string) => {
    alert(`Para conectar ${platform}, você precisará:\n\n1. Criar um App no Facebook/Meta Developers\n2. Obter o Access Token\n3. Configurar as permissões necessárias\n\nEm produção, este processo será automatizado.`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Integrações de Redes Sociais</h2>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'instagram' ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'facebook' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Youtube className="w-4 h-4" />
            YouTube
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>

        {activeTab === 'instagram' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Instagram className="w-6 h-6 text-pink-600" />
                Instagram Shopping
              </h3>

              {getCurrentAccount() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Conectado: {getCurrentAccount().account_name}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleSyncProducts}
                      disabled={loading}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Link className="w-5 h-5" />
                      {loading ? 'Sincronizando...' : 'Sincronizar Produtos'}
                    </button>

                    <button
                      onClick={() => alert('Funcionalidade de criação de post em desenvolvimento')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Criar Post
                    </button>
                  </div>

                  {result && (
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="font-semibold">Resultado:</p>
                      <p className="text-sm text-green-600">✅ Sucesso: {result.success}</p>
                      <p className="text-sm text-red-600">❌ Falhas: {result.failed}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Conecte sua conta do Instagram para começar a vender!</p>
                  <button
                    onClick={() => handleConnectAccount('Instagram')}
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    Conectar Instagram
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Recursos do Instagram Shopping:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Sincronização automática de produtos</li>
                <li>Tags de produtos em posts e stories</li>
                <li>Catálogo de produtos atualizado</li>
                <li>Análise de engajamento e vendas</li>
                <li>Checkout nativo do Instagram</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Facebook className="w-6 h-6 text-blue-600" />
                Facebook Shop
              </h3>

              {getCurrentAccount() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Conectado: {getCurrentAccount().account_name}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleSyncProducts}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Link className="w-5 h-5" />
                      {loading ? 'Sincronizando...' : 'Sincronizar Catálogo'}
                    </button>

                    <button
                      onClick={() => alert('Funcionalidade de análise em desenvolvimento')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <BarChart className="w-5 h-5" />
                      Ver Análises
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Conecte sua Página do Facebook para criar sua loja!</p>
                  <button
                    onClick={() => handleConnectAccount('Facebook')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    Conectar Facebook
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Recursos do Facebook Shop:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Loja completa integrada à Página</li>
                <li>Catálogo de produtos sincronizado</li>
                <li>Posts com tags de produtos</li>
                <li>Checkout pelo Facebook</li>
                <li>Anúncios dinâmicos de produtos</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-600" />
                YouTube - Vídeos Automáticos
              </h3>

              {getCurrentAccount() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Conectado: {getCurrentAccount().account_name}</span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Selecione produtos para criar vídeos:</label>
                    <select
                      multiple
                      value={selectedProducts}
                      onChange={(e) => setSelectedProducts(Array.from(e.target.selectedValues))}
                      className="w-full px-4 py-2 border rounded-lg"
                      size={5}
                    >
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleGenerateVideos}
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Youtube className="w-5 h-5" />
                      {loading ? 'Gerando...' : 'Gerar Vídeos'}
                    </button>

                    <button
                      onClick={() => alert('Funcionalidade de YouTube Shorts em desenvolvimento')}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Criar Shorts
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Conecte seu canal do YouTube para criar vídeos automáticos!</p>
                  <button
                    onClick={() => handleConnectAccount('YouTube')}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    Conectar YouTube
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Recursos do YouTube:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Criação automática de vídeos de produtos</li>
                <li>YouTube Shorts para alcance rápido</li>
                <li>Otimização de títulos e descrições</li>
                <li>Links de compra nas descrições</li>
                <li>Análise de performance dos vídeos</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                WhatsApp Business
              </h3>

              {getCurrentAccount() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Conectado: {getCurrentAccount().account_name}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => alert('Funcionalidade de conversas em desenvolvimento')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Ver Conversas
                    </button>

                    <button
                      onClick={() => alert('Funcionalidade de envio em massa em desenvolvimento')}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Envio em Massa
                    </button>

                    <button
                      onClick={() => alert('Funcionalidade de automação em desenvolvimento')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Automações
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Conecte o WhatsApp Business para atendimento e notificações!</p>
                  <button
                    onClick={() => handleConnectAccount('WhatsApp')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Link className="w-5 h-5" />
                    Conectar WhatsApp
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Recursos do WhatsApp Business:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Confirmação automática de pedidos</li>
                <li>Notificações de status de entrega</li>
                <li>Atendimento ao cliente em tempo real</li>
                <li>Envio de promoções e novidades</li>
                <li>Recuperação de carrinho abandonado</li>
                <li>Recomendações personalizadas</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaPanel;
