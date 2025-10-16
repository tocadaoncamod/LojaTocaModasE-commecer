import { ProductRecommendation } from '../../types/ai';
import { supabase } from '../../lib/supabase';
import { behaviorAnalyzer } from './behaviorAnalyzer';

export class RecommendationEngine {
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    try {
      const behavior = await behaviorAnalyzer.getCustomerBehavior(userId);
      const segment = await behaviorAnalyzer.analyzeCustomerSegment(userId);

      const recommendations: ProductRecommendation[] = [];

      const similarProducts = await this.findSimilarProducts(behavior.viewedProducts, limit);
      recommendations.push(...similarProducts);

      const complementaryProducts = await this.findComplementaryProducts(
        behavior.purchasedProducts,
        limit
      );
      recommendations.push(...complementaryProducts);

      const trendingProducts = await this.getTrendingProducts(
        segment.preferredCategories,
        limit
      );
      recommendations.push(...trendingProducts);

      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);

      return uniqueRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  private async findSimilarProducts(
    viewedProductIds: string[],
    limit: number
  ): Promise<ProductRecommendation[]> {
    if (viewedProductIds.length === 0) return [];

    try {
      const { data: viewedProducts } = await supabase
        .from('products')
        .select('category, subcategory, tags')
        .in('id', viewedProductIds.slice(0, 5));

      if (!viewedProducts || viewedProducts.length === 0) return [];

      const categories = [...new Set(viewedProducts.map(p => p.category))];
      const allTags = viewedProducts.flatMap(p => p.tags || []);

      const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, category, price')
        .in('category', categories)
        .not('id', 'in', `(${viewedProductIds.join(',')})`)
        .limit(limit);

      if (!similarProducts) return [];

      return similarProducts.map(product => ({
        productId: product.id,
        score: this.calculateSimilarityScore(product, allTags),
        reason: `Similar aos produtos que você visualizou em ${product.category}`,
        confidence: 0.8,
        type: 'similar' as const
      }));
    } catch (error) {
      console.error('Error finding similar products:', error);
      return [];
    }
  }

  private async findComplementaryProducts(
    purchasedProductIds: string[],
    limit: number
  ): Promise<ProductRecommendation[]> {
    if (purchasedProductIds.length === 0) return [];

    try {
      const { data: purchasedProducts } = await supabase
        .from('products')
        .select('category, subcategory')
        .in('id', purchasedProductIds.slice(0, 5));

      if (!purchasedProducts || purchasedProducts.length === 0) return [];

      const complementaryCategories = this.getComplementaryCategories(
        purchasedProducts.map(p => p.category)
      );

      const { data: complementaryProducts } = await supabase
        .from('products')
        .select('id, name, category, price')
        .in('category', complementaryCategories)
        .not('id', 'in', `(${purchasedProductIds.join(',')})`)
        .limit(limit);

      if (!complementaryProducts) return [];

      return complementaryProducts.map(product => ({
        productId: product.id,
        score: 0.75,
        reason: `Combina perfeitamente com suas compras anteriores`,
        confidence: 0.75,
        type: 'complementary' as const
      }));
    } catch (error) {
      console.error('Error finding complementary products:', error);
      return [];
    }
  }

  private async getTrendingProducts(
    preferredCategories: string[],
    limit: number
  ): Promise<ProductRecommendation[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: trendingData } = await supabase
        .from('customer_behavior')
        .select('product_id, COUNT(*) as view_count')
        .eq('action_type', 'view')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .limit(limit * 2);

      if (!trendingData || trendingData.length === 0) return [];

      const productIds = trendingData.map(t => t.product_id);

      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, price')
        .in('id', productIds);

      if (!products) return [];

      return products
        .filter(p => preferredCategories.length === 0 || preferredCategories.includes(p.category))
        .slice(0, limit)
        .map(product => ({
          productId: product.id,
          score: 0.85,
          reason: 'Produto em alta demanda',
          confidence: 0.85,
          type: 'trending' as const
        }));
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  private calculateSimilarityScore(product: any, targetTags: string[]): number {
    const productTags = product.tags || [];
    const matchingTags = productTags.filter((tag: string) => targetTags.includes(tag));

    if (productTags.length === 0) return 0.5;

    return 0.5 + (matchingTags.length / productTags.length) * 0.5;
  }

  private getComplementaryCategories(categories: string[]): string[] {
    const complementaryMap: Record<string, string[]> = {
      'Calças': ['Camisetas', 'Blusas', 'Sapatos', 'Cintos'],
      'Camisetas': ['Calças', 'Shorts', 'Jaquetas'],
      'Vestidos': ['Sapatos', 'Bolsas', 'Acessórios'],
      'Blusas': ['Calças', 'Saias', 'Colares'],
      'Jaquetas': ['Camisetas', 'Calças', 'Cachecóis'],
      'Sapatos': ['Calças', 'Vestidos', 'Meias']
    };

    const complementary = new Set<string>();
    categories.forEach(cat => {
      const comps = complementaryMap[cat] || [];
      comps.forEach(c => complementary.add(c));
    });

    return Array.from(complementary);
  }

  private deduplicateRecommendations(
    recommendations: ProductRecommendation[]
  ): ProductRecommendation[] {
    const seen = new Map<string, ProductRecommendation>();

    recommendations.forEach(rec => {
      const existing = seen.get(rec.productId);
      if (!existing || rec.score > existing.score) {
        seen.set(rec.productId, rec);
      }
    });

    return Array.from(seen.values());
  }

  async getRecommendationsForProduct(
    productId: string,
    limit: number = 6
  ): Promise<ProductRecommendation[]> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('category, subcategory, tags, price')
        .eq('id', productId)
        .maybeSingle();

      if (!product) return [];

      const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, category, price, tags')
        .eq('category', product.category)
        .neq('id', productId)
        .limit(limit * 2);

      if (!similarProducts) return [];

      return similarProducts
        .map(p => ({
          productId: p.id,
          score: this.calculateSimilarityScore(p, product.tags || []),
          reason: 'Produtos similares',
          confidence: 0.8,
          type: 'similar' as const
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      return [];
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
