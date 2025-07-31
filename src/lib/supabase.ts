import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DatabaseAdminUser {
  id: string;
  username: string;
  password: string;
  display_name?: string;
  email?: string;
  profile_image?: string;
  role: 'admin' | 'manager';
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}