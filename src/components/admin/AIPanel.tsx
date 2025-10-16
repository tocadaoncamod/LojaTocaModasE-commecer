import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Target, Tag, Video, FileText, BarChart } from 'lucide-react';
import { aiDescriptionGenerator } from '../../services/ai/aiDescriptionGenerator';
import { aiVideoGenerator } from '../../services/ai/aiVideoGenerator';
import { trendDetector } from '../../services/ai/trendDetector';
import { tagSuggester } from '../../services/ai/tagSuggester';
import { campaignAutomation } from '../../services/ai/campaignAutomation';
import { recommendationEngine } from '../../services/ai/recommendationEngine';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url: string;
}

const AIPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'description' | 'video' | 'trends' | 'tags' | 'campaigns'>('description');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, category, description, image_url')
        .limit(50);

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      const description = await aiDescriptionGenerator.generateDescription(
        product.name,
        product.category,
        [product.image_url],
        product.description ? { description: product.description } : undefined
      );

      setResult(description);

      await aiDescriptionGenerator.saveDescription(selectedProduct, description);

      alert('Descrição gerada e salva com sucesso!');
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Erro ao gerar descrição');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const videoUrl = await aiVideoGenerator.generateVideoFromProduct(selectedProduct);
      setResult({ videoUrl });
      alert('Vídeo gerado com sucesso!');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Erro ao gerar vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    setLoading(true);
    try {
      const trends = await trendDetector.detectTrends('month');
      setResult(trends);
    } catch (error) {
      console.error('Error analyzing trends:', error);
      alert('Erro ao analisar tendências');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      const suggestions = await tagSuggester.suggestTags(
        product.name,
        product.category,
        product.description,
        product.image_url
      );

      setResult(suggestions);
    } catch (error) {
      console.error('Error suggesting tags:', error);
      alert('Erro ao sugerir tags');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCampaigns = async () => {
    setLoading(true);
    try {
      const campaigns = await campaignAutomation.generateCampaignSuggestions();
      setResult(campaigns);
    } catch (error) {
      console.error('Error generating campaigns:', error);
      alert('Erro ao gerar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaign: any) => {
    try {
      await campaignAutomation.createAutomatedCampaign(campaign);
      alert('Campanha criada com sucesso!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Erro ao criar campanha');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold">Inteligência Artificial</h2>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'description' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Descrições
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'video' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Video className="w-4 h-4" />
            Vídeos
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'trends' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Tendências
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'tags' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Tags e SEO
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'campaigns' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4" />
            Campanhas
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Gerador Automático de Descrições
            </h3>
            <p className="text-gray-600">
              Gere descrições atraentes e otimizadas com base nas imagens e categoria do produto.
            </p>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecione um produto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateDescription}
              disabled={loading || !selectedProduct}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Gerando...</>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Gerar Descrição
                </>
              )}
            </button>

            {result && activeTab === 'description' && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Título:</h4>
                  <p>{result.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Descrição:</h4>
                  <p>{result.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Características:</h4>
                  <ul className="list-disc list-inside">
                    {result.features.map((feature: string, idx: number) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Gerador Automático de Vídeos
            </h3>
            <p className="text-gray-600">
              Crie vídeos profissionais dos produtos automaticamente.
            </p>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecione um produto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateVideo}
              disabled={loading || !selectedProduct}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Gerando...</>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Gerar Vídeo
                </>
              )}
            </button>

            {result && activeTab === 'video' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-green-600 font-semibold">Vídeo gerado com sucesso!</p>
                <p className="text-sm text-gray-600 mt-2">URL: {result.videoUrl}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Análise de Tendências
            </h3>
            <p className="text-gray-600">
              Detecte tendências de mercado e comportamento dos clientes.
            </p>

            <button
              onClick={handleAnalyzeTrends}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Analisando...</>
              ) : (
                <>
                  <BarChart className="w-5 h-5" />
                  Analisar Tendências
                </>
              )}
            </button>

            {result && activeTab === 'trends' && Array.isArray(result) && (
              <div className="space-y-3">
                {result.map((trend: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg">{trend.category}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-600">Taxa de Crescimento:</p>
                        <p className={`text-lg font-bold ${trend.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.growthRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Volume de Busca:</p>
                        <p className="text-lg font-bold">{trend.searchVolume}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              Sugestão de Tags e SEO
            </h3>
            <p className="text-gray-600">
              Otimize seus produtos com tags e palavras-chave inteligentes.
            </p>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecione um produto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category}
                </option>
              ))}
            </select>

            <button
              onClick={handleSuggestTags}
              disabled={loading || !selectedProduct}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Gerando...</>
              ) : (
                <>
                  <Tag className="w-5 h-5" />
                  Sugerir Tags
                </>
              )}
            </button>

            {result && activeTab === 'tags' && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Tags Sugeridas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Palavras-chave:</h4>
                  <p className="text-sm text-gray-600">{result.keywords.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">SEO:</h4>
                  <p className="text-sm"><strong>Título:</strong> {result.seoMetadata.title}</p>
                  <p className="text-sm mt-1"><strong>Descrição:</strong> {result.seoMetadata.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              Campanhas Automáticas
            </h3>
            <p className="text-gray-600">
              Crie campanhas inteligentes baseadas em desempenho e tendências.
            </p>

            <button
              onClick={handleGenerateCampaigns}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>Gerando...</>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Gerar Sugestões
                </>
              )}
            </button>

            {result && activeTab === 'campaigns' && Array.isArray(result) && (
              <div className="space-y-3">
                {result.map((campaign: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg capitalize">{campaign.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Desconto: {campaign.suggestedDiscount}% | Duração: {campaign.duration} dias
                        </p>
                        <p className="text-sm text-gray-600">
                          Produtos: {campaign.targetProducts.length} | Público: {campaign.targetAudience.join(', ')}
                        </p>
                        <p className="text-sm font-semibold text-green-600 mt-2">
                          Receita Esperada: R$ {campaign.expectedRevenue.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCreateCampaign(campaign)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Criar Campanha
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
