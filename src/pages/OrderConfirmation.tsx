import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Home,
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';
import { getOrderByNumber, getOrderStatusHistory } from '../services/orderService';
import { Order, OrderStatusHistory } from '../types/order';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      loadOrderData();
    }
  }, [orderNumber]);

  const loadOrderData = async () => {
    if (!orderNumber) return;

    try {
      setLoading(true);
      const orderData = await getOrderByNumber(orderNumber);
      if (orderData) {
        setOrder(orderData);
        const history = await getOrderStatusHistory(orderData.id);
        setStatusHistory(history);
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando Pagamento',
      processing: 'Em Preparação',
      shipped: 'Em Trânsito',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto Bancário'
    };
    return labels[method] || method;
  };

  const getShippingMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      correios_pac: 'Correios PAC',
      correios_sedex: 'Correios SEDEX',
      transportadora: 'Transportadora',
      pickup: 'Retirada na Loja'
    };
    return labels[method] || method;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar este pedido.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para Home
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-600">
              Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Número do Pedido</p>
                <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(order.orderNumber)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Status do Pedido</h3>
              </div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Data do Pedido</h3>
              </div>
              <p className="text-gray-700">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity}
                      {item.size && ` | Tamanho: ${item.size}`}
                      {item.color && ` | Cor: ${item.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} cada</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="font-semibold">
                  {order.shippingCost === 0 ? 'Grátis' : formatPrice(order.shippingCost)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-4">
              <span>Total</span>
              <span className="text-green-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Informações de Entrega</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Método de Entrega</p>
                <p className="font-semibold">{getShippingMethodLabel(order.shippingMethod)}</p>
              </div>
              {order.trackingCode && (
                <div>
                  <p className="text-sm text-gray-600">Código de Rastreamento</p>
                  <p className="font-semibold text-blue-600">{order.trackingCode}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Endereço de Entrega</p>
                <p className="font-medium">
                  {order.shippingAddress.street}, {order.shippingAddress.number}
                  {order.shippingAddress.complement && `, ${order.shippingAddress.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state}
                </p>
                <p className="text-sm text-gray-600">CEP: {order.shippingAddress.zipCode}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Informações de Pagamento</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Método de Pagamento</p>
                <p className="font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status do Pagamento</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Pago' :
                   order.paymentStatus === 'failed' ? 'Falhou' :
                   'Aguardando Pagamento'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.customerEmail}</p>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Histórico do Pedido</h3>
            <div className="space-y-4">
              {statusHistory.map((history, index) => (
                <div key={history.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                    {index < statusHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">{getStatusLabel(history.status)}</p>
                    <p className="text-sm text-gray-600">{formatDate(history.createdAt)}</p>
                    {history.notes && (
                      <p className="text-sm text-gray-500 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Voltar para Home
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Imprimir Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
