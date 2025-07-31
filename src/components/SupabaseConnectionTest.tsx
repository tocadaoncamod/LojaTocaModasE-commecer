import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('checking');
    
    try {
      // Test 1: Check Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      setConnectionStatus('connected');

      // Test 2: Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Test 3: Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Test 4: Load admin users
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, username, role, display_name, created_at')
        .limit(5);

      // Test 5: Test insert capability (create a test product)
      const testProduct = {
        name: `Test Product ${Date.now()}`,
        price: 99.99,
        image_url: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Teste'
      };

      const { data: insertTest, error: insertError } = await supabase
        .from('products')
        .insert([testProduct])
        .select();

      // Clean up test product
      if (insertTest && insertTest[0]) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertTest[0].id);
      }

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setAdminUsers(adminData || []);

      setTestResults({
        connection: { success: true, message: 'Conexão estabelecida' },
        products: { 
          success: !productsError, 
          message: productsError ? productsError.message : `${productsData?.length || 0} produtos encontrados`,
          count: productsData?.length || 0
        },
        orders: { 
          success: !ordersError, 
          message: ordersError ? ordersError.message : `${ordersData?.length || 0} pedidos encontrados`,
          count: ordersData?.length || 0
        },
        adminUsers: { 
          success: !adminError, 
          message: adminError ? adminError.message : `${adminData?.length || 0} usuários admin encontrados`,
          count: adminData?.length || 0
        },
        insert: { 
          success: !insertError, 
          message: insertError ? insertError.message : 'Inserção funcionando corretamente'
        }
      });

    } catch (error) {
      console.error('Supabase test error:', error);
      setConnectionStatus('error');
      setTestResults({
        connection: { success: false, message: (error as Error).message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Status da Conexão Supabase
                </h3>
                <p className="text-gray-600">Verificação completa do banco de dados</p>
              </div>
            </div>
            <button
              onClick={checkConnection}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Verificando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              {connectionStatus === 'checking' && <AlertCircle className="h-6 w-6 text-yellow-600 animate-pulse" />}
              {connectionStatus === 'connected' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {connectionStatus === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
              <h4 className="text-lg font-semibold">
                Status da Conexão: {
                  connectionStatus === 'checking' ? 'Verificando...' :
                  connectionStatus === 'connected' ? 'Conectado ✅' :
                  'Erro na Conexão ❌'
                }
              </h4>
            </div>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Resultados dos Testes:</h4>
              
              {Object.entries(testResults).map(([test, result]: [string, any]) => (
                <div key={test} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <div>
                      <p className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  {result.count !== undefined && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {result.count} registros
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Data Preview */}
          {connectionStatus === 'connected' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-3">
                  Produtos Recentes ({products.length})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="text-sm">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-blue-700">R$ {product.price}</p>
                      <p className="text-xs text-gray-600">{formatDate(product.created_at)}</p>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum produto encontrado</p>
                  )}
                </div>
              </div>

              {/* Orders */}
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 mb-3">
                  Pedidos Recentes ({orders.length})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-green-700">R$ {order.total}</p>
                      <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum pedido encontrado</p>
                  )}
                </div>
              </div>

              {/* Admin Users */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h5 className="font-semibold text-purple-900 mb-3">
                  Usuários Admin ({adminUsers.length})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="text-sm">
                      <p className="font-medium">{user.display_name || user.username}</p>
                      <p className="text-purple-700 capitalize">{user.role}</p>
                      <p className="text-xs text-gray-600">{formatDate(user.created_at)}</p>
                    </div>
                  ))}
                  {adminUsers.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum usuário encontrado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-900 mb-3">Informações do Ambiente:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Supabase URL:</strong></p>
                <p className="text-xs text-gray-600 break-all">
                  {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
                </p>
              </div>
              <div>
                <p><strong>Anon Key:</strong></p>
                <p className="text-xs text-gray-600">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado ✅' : 'Não configurado ❌'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;