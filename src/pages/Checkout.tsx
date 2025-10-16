import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  FileText,
  Truck,
  Package,
  Store,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { createOrder, shippingOptions, paymentOptions } from '../services/orderService';
import { CheckoutData, PaymentMethod, ShippingMethod } from '../types/order';
import { supabase } from '../lib/supabase';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<CheckoutData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCpf: '',
    shippingAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    paymentMethod: 'pix',
    shippingMethod: 'correios_pac',
    notes: ''
  });

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>('correios_pac');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          customerEmail: data.user.email || ''
        }));
      }
    });
  }, [items, navigate]);

  const shippingCost = shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0;
  const finalTotal = total + shippingCost;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('shippingAddress.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError('Preencha todos os campos obrigatórios');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const addr = formData.shippingAddress;
    if (!addr.street || !addr.number || !addr.neighborhood || !addr.city || !addr.state || !addr.zipCode) {
      setError('Preencha todos os campos do endereço');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const checkoutData: CheckoutData = {
        ...formData,
        paymentMethod: selectedPayment,
        shippingMethod: selectedShipping
      };

      const order = await createOrder(items, checkoutData, user?.id);
      clearCart();
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      setError('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (id: string) => {
    switch (id) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-6 w-6" />;
      case 'pix':
        return <Smartphone className="h-6 w-6" />;
      case 'boleto':
        return <FileText className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getShippingIcon = (id: string) => {
    switch (id) {
      case 'pickup':
        return <Store className="h-6 w-6" />;
      case 'transportadora':
        return <Package className="h-6 w-6" />;
      default:
        return <Truck className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s < step ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-1 w-12 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span className={step === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Dados</span>
            <span className={step === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Endereço</span>
            <span className={step === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Entrega</span>
            <span className={step === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Pagamento</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      type="text"
                      value={formData.customerCpf}
                      onChange={(e) => handleInputChange('customerCpf', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) => handleInputChange('shippingAddress.zipCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.street}
                        onChange={(e) => handleInputChange('shippingAddress.street', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.number}
                        onChange={(e) => handleInputChange('shippingAddress.number', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.complement}
                        onChange={(e) => handleInputChange('shippingAddress.complement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Apto, bloco, etc"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.neighborhood}
                        onChange={(e) => handleInputChange('shippingAddress.neighborhood', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Bairro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Forma de Entrega</h2>
                  {shippingOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedShipping(option.id)}
                      className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                        selectedShipping === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={selectedShipping === option.id ? 'text-blue-600' : 'text-gray-400'}>
                        {getShippingIcon(option.id)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                        <div className="text-sm text-gray-500">{option.estimatedDays}</div>
                      </div>
                      <div className="font-bold text-lg">
                        {option.price === 0 ? 'Grátis' : formatPrice(option.price)}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Forma de Pagamento</h2>
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedPayment(option.id)}
                      className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                        selectedPayment === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={selectedPayment === option.id ? 'text-blue-600' : 'text-gray-400'}>
                        {getPaymentIcon(option.id)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </button>
                  ))}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Alguma observação sobre o pedido?"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Pedido'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.size && `Tamanho: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Cor: ${item.color}`}
                      </p>
                      <p className="text-sm">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>{shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
