export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'boleto';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShippingMethod = 'correios_pac' | 'correios_sedex' | 'transportadora' | 'pickup';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: number;
  productName: string;
  productImageUrl: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  trackingCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CheckoutData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  notes?: string;
}

export interface ShippingOption {
  id: ShippingMethod;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
}

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
}
