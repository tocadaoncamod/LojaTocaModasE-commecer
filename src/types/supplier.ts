export interface Supplier {
  id: string;
  name: string;
  vendizapUrl: string;
  catalogUrl: string;
  description?: string;
  contactInfo: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  categories: string[];
  lastSync?: Date;
  totalProducts?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierProductId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  sku?: string;
  sizes?: string[];
  colors?: string[];
  vendizapData?: any;
  lastUpdated: Date;
}

export interface CatalogSyncResult {
  success: boolean;
  totalProducts: number;
  newProducts: number;
  updatedProducts: number;
  errors: string[];
  syncedAt: Date;
  supplierName: string;
  supplierUrl: string;
}