import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro tentar carregar da tabela teste_produtos_extraidos
      const { data: testData, error: testError } = await supabase
        .from('teste_produtos_extraidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (testError) {
        console.error('Erro ao carregar teste_produtos_extraidos:', testError);
        throw testError;
      }

      let transformedProducts: Product[] = [];

      if (testData && testData.length > 0) {
        // Usar dados da tabela teste_produtos_extraidos
        console.log('✅ Carregando produtos da tabela teste_produtos_extraidos:', testData.length);
        
        transformedProducts = testData.map(product => ({
          id: product.id,
          name: product.nome || 'Produto sem nome',
          price: parseFloat(product.preco?.replace('R$', '').replace(',', '.').trim()) || 0,
          oldPrice: undefined,
          imageUrl: product.imagem || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: product.categoria || 'Geral'
        }));
      } else {
        // Fallback para tabela products se teste_produtos_extraidos estiver vazia
        console.log('⚠️ Tabela teste_produtos_extraidos vazia, usando tabela products');
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Erro ao carregar products:', productsError);
          throw productsError;
        }

        transformedProducts = (productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
          imageUrl: product.image_url,
          category: product.category || 'Geral'
        }));
      }

      console.log('📦 Produtos carregados:', transformedProducts.length);
      console.log('🏷️ Categorias encontradas:', [...new Set(transformedProducts.map(p => p.category))]);
      
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