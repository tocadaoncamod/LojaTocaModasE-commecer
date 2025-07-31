export interface SellerApplication {
  id: string;
  email: string;
  storeName: string;
  cpfCnpj: string;
  whatsapp: string;
  businessDescription?: string;
  experienceYears: number;
  monthlySalesEstimate?: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerData {
  id: string;
  userId?: string;
  storeName: string;
  cpfCnpj: string;
  whatsapp: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerSale {
  id: string;
  sellerId: string;
  orderId: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerCommission {
  id: string;
  sellerId: string;
  saleId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: Date;
  paymentReference?: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userType: 'admin' | 'seller';
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}