import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  description?: string;
  material?: string;
  care_instructions?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipping_time_days?: number;
  warranty_days?: number;
  tags?: string[];
  keywords?: string;
  featured_category?: string;
  video_url?: string;
  origin_location?: string;
  discount_type?: string;
  discount_value?: number;
  measurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
  };
  stock?: number;
  is_active?: boolean;
  sales_count?: number;
  rating_average?: number;
  images?: string[];
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Erro ao carregar produtos:', productsError);
        throw productsError;
      }

      const productIds = (productsData || []).map(p => p.id);

      let imagesMap = new Map<number, string[]>();
      if (productIds.length > 0) {
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds)
          .order('display_order', { ascending: true });

        if (imagesData) {
          imagesData.forEach(img => {
            if (!imagesMap.has(img.product_id)) {
              imagesMap.set(img.product_id, []);
            }
            imagesMap.get(img.product_id)!.push(img.image_url);
          });
        }
      }

      const transformedProducts: Product[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
        imageUrl: product.image_url,
        category: product.category || 'Geral',
        subcategory: product.subcategory,
        brand: product.brand,
        sku: product.sku,
        description: product.description,
        material: product.material,
        care_instructions: product.care_instructions,
        weight: product.weight,
        dimensions: product.dimensions,
        shipping_time_days: product.shipping_time_days,
        warranty_days: product.warranty_days,
        tags: product.tags || [],
        keywords: product.keywords,
        featured_category: product.featured_category,
        video_url: product.video_url,
        origin_location: product.origin_location,
        discount_type: product.discount_type,
        discount_value: product.discount_value,
        measurements: product.measurements || {},
        stock: product.stock || 0,
        is_active: product.is_active !== false,
        sales_count: product.sales_count || 0,
        rating_average: product.rating_average || 0,
        images: imagesMap.get(product.id) || []
      }));

      console.log('✅ Produtos carregados:', transformedProducts.length);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('❌ Erro ao carregar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts
  };
};
