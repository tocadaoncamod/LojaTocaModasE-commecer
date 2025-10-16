import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types/cart';
import { supabase } from '../lib/supabase';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}
const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const navigate = useNavigate();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerData>>({});

  const saveOrderToDatabase = async (): Promise<string | null> => {
    try {
      // Criar o pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: customerData.name,
            customer_phone: customerData.phone,
            customer_address: customerData.address,
            total: total,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Criar os itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.imageUrl
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Tentar deletar o pedido se os itens falharam
        await supabase.from('orders').delete().eq('id', orderData.id);
        return null;
      }

      return orderData.id;
    } catch (error) {
      console.error('Unexpected error saving order:', error);
      return null;
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<CustomerData> = {};
    
    if (!customerData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!customerData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório';
    } else if (customerData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    if (!customerData.address.trim()) {
      errors.address = 'Endereço é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    // Salvar pedido no banco de dados
    const orderId = await saveOrderToDatabase();
    
    if (!orderId) {
      alert('Erro ao salvar pedido. Tente novamente.');
      return;
    }

    const phoneNumber = '5512992058243';
    
    let message = `🐆 *Pedido #${orderId.split('-')[0]} - Toca da Onça*\n\n`;
    
    message += '👤 *Dados do Cliente:*\n';
    message += `Nome: ${customerData.name}\n`;
    message += `Telefone: ${customerData.phone}\n`;
    message += `Endereço: ${customerData.address}\n\n`;
    
    message += '📋 *Itens do Pedido:*\n';
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: ${formatPrice(item.price)}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });
    
    message += `💰 *Total do Pedido: ${formatPrice(total)}*\n\n`;
    message += '📞 Gostaria de finalizar este pedido!';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho, resetar form e fechar modal
    onClearCart();
    setShowCustomerForm(false);
    setCustomerData({ name: '', phone: '', address: '' });
    setFormErrors({});
    onClose();
  };

  const handleStartCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleStartWhatsAppCheckout = () => {
    setShowCustomerForm(true);
  };

  const handleBackToCart = () => {
    setShowCustomerForm(false);
    setFormErrors({});
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm md:max-w-md h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-blue-800 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              {showCustomerForm ? 'Dados para Entrega' : 'Seu Carrinho'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {showCustomerForm ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">📋 Quase lá!</span> Preencha seus dados para finalizar o pedido
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite seu nome completo"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => handleCustomerDataChange('phone', formatPhoneNumber(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(12) 99999-9999"
                  maxLength={15}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo *
                </label>
                <textarea
                  value={customerData.address}
                  onChange={(e) => handleCustomerDataChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  rows={3}
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base md:text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl md:text-2xl font-bold text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full transition-colors shadow-md text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">📱</span>
                    Enviar Pedido via WhatsApp
                  </button>
                  <button
                    onClick={handleBackToCart}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full transition-colors text-sm md:text-base"
                  >
                    ← Voltar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                Adicione alguns produtos incríveis da Toca da Onça!
              </p>
              <button
                onClick={onClose}
                className="bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-xs md:text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-blue-600 font-bold text-sm md:text-base">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 md:p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 md:p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base md:text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl md:text-2xl font-bold text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleStartCheckout}
                    className="w-full bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold py-4 rounded-full transition-colors shadow-md text-sm md:text-base"
                  >
                    Finalizar Compra
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full transition-colors text-sm md:text-base"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;