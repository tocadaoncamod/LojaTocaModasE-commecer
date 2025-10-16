import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, RefreshCw, Settings, CheckCircle2, XCircle, Users, BarChart } from 'lucide-react';
import { evolutionApiService } from '../../services/evolutionApiService';
import { supabase } from '../../lib/supabase';

const EvolutionApiPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'send' | 'config' | 'analytics'>('messages');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsConfigured(evolutionApiService.isConfigured());
    if (evolutionApiService.isConfigured()) {
      loadInstanceStatus();
      loadConversations();
    }
  }, []);

  const loadInstanceStatus = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const status = await evolutionApiService.getInstanceStatus();
      setInstanceStatus(status);

      if (status !== 'open' && status !== 'connected') {
        const qr = await evolutionApiService.getQRCode();
        if (qr) {
          setQrCode(qr);
        } else {
          setErrorMessage('Não foi possível obter o QR Code. Verifique se a instância existe.');
        }
      } else {
        setQrCode(null);
      }
    } catch (error: any) {
      console.error('Error loading instance status:', error);
      setErrorMessage(error.message || 'Erro ao carregar status da instância');
      setInstanceStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(50);

      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);

    await supabase
      .from('whatsapp_conversations')
      .update({ unread_count: 0 })
      .eq('id', conversation.id);

    loadConversations();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      await evolutionApiService.sendTextMessage(
        selectedConversation.customer_phone,
        newMessage
      );

      setNewMessage('');
      await loadMessages(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessage.trim() || !phoneNumber.trim()) return;

    setLoading(true);
    try {
      const numbers = phoneNumber.split(',').map(n => n.trim());

      const result = await evolutionApiService.sendBulkMessages(
        numbers,
        bulkMessage
      );

      alert(`Mensagens enviadas!\nSucesso: ${result.success}\nFalhas: ${result.failed}`);

      setBulkMessage('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      alert('Erro ao enviar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await evolutionApiService.createInstance();
      await loadInstanceStatus();
      alert('Instância criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating instance:', error);
      setErrorMessage('Erro ao criar instância');
      alert('Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupWebhook = async () => {
    setLoading(true);
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolution-webhook`;

      await evolutionApiService.setWebhook(webhookUrl);

      alert('Webhook configurado com sucesso!');
    } catch (error) {
      console.error('Error setting webhook:', error);
      alert('Erro ao configurar webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold">Evolution API</h2>
                <p className="text-sm text-gray-600">
                  Status: {instanceStatus === 'open' ? (
                    <span className="text-green-600 font-semibold">✓ Conectado</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Desconectado</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={loadInstanceStatus}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>

        {!isConfigured && (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Configuração Necessária</h3>
              <p className="text-yellow-700 mb-4">
                Configure as variáveis de ambiente no arquivo .env:
              </p>
              <pre className="bg-white p-4 rounded border text-sm">
{`VITE_EVOLUTION_API_URL=https://sua-instancia.easypanel.host
VITE_EVOLUTION_API_KEY=seu_token_aqui
VITE_EVOLUTION_INSTANCE_NAME=sua_instancia`}
              </pre>
            </div>
          </div>
        )}

        {isConfigured && (
          <>
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'messages'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Conversas
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'send'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Enviar
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'config'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Configurações
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart className="w-4 h-4 inline mr-2" />
                Análises
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'messages' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-semibold">Conversas</h3>
                    </div>
                    <div className="overflow-y-auto h-[550px]">
                      {conversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`w-full px-4 py-3 border-b hover:bg-gray-50 text-left ${
                            selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{conv.customer_name || conv.customer_phone}</p>
                              <p className="text-sm text-gray-600 truncate">{conv.customer_phone}</p>
                            </div>
                            {conv.unread_count > 0 && (
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 border rounded-lg flex flex-col">
                    {selectedConversation ? (
                      <>
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h3 className="font-semibold">
                            {selectedConversation.customer_name || selectedConversation.customer_phone}
                          </h3>
                          <p className="text-sm text-gray-600">{selectedConversation.customer_phone}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {messages.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.from_number === selectedConversation.customer_phone ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${
                                  msg.from_number === selectedConversation.customer_phone
                                    ? 'bg-gray-100'
                                    : 'bg-green-500 text-white'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t p-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Digite sua mensagem..."
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={loading}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Selecione uma conversa
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'send' && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Envio em Massa</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Números (separados por vírgula)
                        </label>
                        <textarea
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="5511999999999, 5511888888888"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Mensagem</label>
                        <textarea
                          value={bulkMessage}
                          onChange={(e) => setBulkMessage(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Digite sua mensagem..."
                        />
                      </div>

                      <button
                        onClick={handleSendBulkMessage}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Enviando...' : 'Enviar Mensagens'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configurações da Instância</h3>

                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{errorMessage}</p>
                      </div>
                    )}

                    {loading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
                        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-2" />
                        <p className="text-blue-800">Carregando...</p>
                      </div>
                    )}

                    {!loading && qrCode && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Escaneie o QR Code com seu WhatsApp:
                        </p>
                        <img src={qrCode} alt="QR Code" className="mx-auto max-w-sm" />
                        <p className="text-xs text-gray-500 mt-4">
                          Abra o WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho
                        </p>
                      </div>
                    )}

                    {!loading && instanceStatus === 'open' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                        <p className="text-green-800 font-semibold">WhatsApp Conectado!</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <button
                        onClick={handleCreateInstance}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Criando...' : 'Criar/Reconectar Instância'}
                      </button>

                      <button
                        onClick={handleSetupWebhook}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Configurando...' : 'Configurar Webhook'}
                      </button>

                      <button
                        onClick={loadInstanceStatus}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Atualizar Status
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="max-w-4xl">
                  <h3 className="text-lg font-semibold mb-4">Análises</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total de Conversas</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{conversations.length}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Conversas Abertas</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {conversations.filter(c => c.status === 'open').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">Não Lidas</p>
                      <p className="text-3xl font-bold text-yellow-900 mt-2">
                        {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvolutionApiPanel;
