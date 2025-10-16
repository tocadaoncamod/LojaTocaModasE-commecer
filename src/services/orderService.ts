import { supabase } from '../lib/supabase';
import { Order, OrderItem, CheckoutData, ShippingOption, PaymentOption } from '../types/order';
import { CartItem } from '../types/cart';

export const shippingOptions: ShippingOption[] = [
  {
    id: 'correios_pac',
    name: 'Correios PAC',
    description: 'Entrega econômica',
    estimatedDays: '10-15 dias úteis',
    price: 15.00
  },
  {
    id: 'correios_sedex',
    name: 'Correios SEDEX',
    description: 'Entrega expressa',
    estimatedDays: '2-5 dias úteis',
    price: 35.00
  },
  {
    id: 'transportadora',
    name: 'Transportadora',
    description: 'Para pedidos maiores',
    estimatedDays: '7-10 dias úteis',
    price: 25.00
  },
  {
    id: 'pickup',
    name: 'Retirar na Loja',
    description: 'Retire pessoalmente',
    estimatedDays: 'Imediato',
    price: 0
  }
];

export const paymentOptions: PaymentOption[] = [
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    description: 'Parcelamento em até 12x',
    icon: 'credit-card'
  },
  {
    id: 'debit_card',
    name: 'Cartão de Débito',
    description: 'À vista com desconto',
    icon: 'credit-card'
  },
  {
    id: 'pix',
    name: 'PIX',
    description: 'Aprovação imediata',
    icon: 'smartphone'
  },
  {
    id: 'boleto',
    name: 'Boleto Bancário',
    description: 'Vencimento em 3 dias',
    icon: 'file-text'
  }
];

export const calculateShipping = (method: string, zipCode?: string): number => {
  const option = shippingOptions.find(opt => opt.id === method);
  return option ? option.price : 0;
};

export const createOrder = async (
  cartItems: CartItem[],
  checkoutData: CheckoutData,
  userId?: string
): Promise<Order> => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = calculateShipping(checkoutData.shippingMethod);
  const totalAmount = subtotal + shippingCost;

  const orderData = {
    user_id: userId || null,
    order_number: '',
    status: 'pending',
    total_amount: totalAmount,
    subtotal: subtotal,
    shipping_cost: shippingCost,
    discount: 0,
    payment_method: checkoutData.paymentMethod,
    payment_status: 'pending',
    shipping_method: checkoutData.shippingMethod,
    customer_name: checkoutData.customerName,
    customer_email: checkoutData.customerEmail,
    customer_phone: checkoutData.customerPhone,
    customer_cpf: checkoutData.customerCpf || null,
    shipping_address: checkoutData.shippingAddress,
    billing_address: checkoutData.billingAddress || checkoutData.shippingAddress,
    notes: checkoutData.notes || null
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (orderError) {
    console.error('Erro ao criar pedido:', orderError);
    throw new Error('Erro ao criar pedido: ' + orderError.message);
  }

  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    product_image_url: item.imageUrl,
    size: item.size || null,
    color: item.color || null,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Erro ao criar itens do pedido:', itemsError);
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error('Erro ao criar itens do pedido: ' + itemsError.message);
  }

  return transformOrder(order);
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Erro ao buscar pedido:', orderError);
    return null;
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  const transformedOrder = transformOrder(order);
  transformedOrder.items = items?.map(transformOrderItem) || [];

  return transformedOrder;
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (orderError || !order) {
    console.error('Erro ao buscar pedido:', orderError);
    return null;
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const transformedOrder = transformOrder(order);
  transformedOrder.items = items?.map(transformOrderItem) || [];

  return transformedOrder;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    return [];
  }

  return orders.map(transformOrder);
};

export const getOrderStatusHistory = async (orderId: string) => {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar histórico do pedido:', error);
    return [];
  }

  return data;
};

const transformOrder = (order: any): Order => ({
  id: order.id,
  userId: order.user_id,
  orderNumber: order.order_number,
  status: order.status,
  totalAmount: parseFloat(order.total_amount),
  subtotal: parseFloat(order.subtotal),
  shippingCost: parseFloat(order.shipping_cost),
  discount: parseFloat(order.discount),
  paymentMethod: order.payment_method,
  paymentStatus: order.payment_status,
  shippingMethod: order.shipping_method,
  trackingCode: order.tracking_code,
  customerName: order.customer_name,
  customerEmail: order.customer_email,
  customerPhone: order.customer_phone,
  customerCpf: order.customer_cpf,
  shippingAddress: order.shipping_address,
  billingAddress: order.billing_address,
  notes: order.notes,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  deliveredAt: order.delivered_at
});

const transformOrderItem = (item: any): OrderItem => ({
  id: item.id,
  orderId: item.order_id,
  productId: item.product_id,
  productName: item.product_name,
  productImageUrl: item.product_image_url,
  size: item.size,
  color: item.color,
  quantity: item.quantity,
  unitPrice: parseFloat(item.unit_price),
  totalPrice: parseFloat(item.total_price)
});
