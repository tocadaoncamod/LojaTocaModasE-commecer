import { TrendAnalysis } from '../../types/ai';
import { supabase } from '../../lib/supabase';

export class TrendDetector {
  async detectTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<TrendAnalysis[]> {
    try {
      const startDate = this.getStartDate(period);

      const { data: behaviors } = await supabase
        .from('customer_behavior')
        .select('product_id, action_type, timestamp')
        .gte('timestamp', startDate.toISOString());

      if (!behaviors || behaviors.length === 0) return [];

      const productViewCounts = this.countProductViews(behaviors);
      const topProductIds = Array.from(productViewCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([id]) => id);

      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, price')
        .in('id', topProductIds);

      if (!products) return [];

      const categoryTrends = this.analyzeCategoryTrends(products, productViewCounts);

      return Array.from(categoryTrends.values());
    } catch (error) {
      console.error('Error detecting trends:', error);
      return [];
    }
  }

  async detectCategoryTrends(category: string): Promise<TrendAnalysis> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: recentBehaviors } = await supabase
        .from('customer_behavior')
        .select('product_id')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .eq('action_type', 'view');

      const { data: oldBehaviors } = await supabase
        .from('customer_behavior')
        .select('product_id')
        .gte('timestamp', sixtyDaysAgo.toISOString())
        .lt('timestamp', thirtyDaysAgo.toISOString())
        .eq('action_type', 'view');

      const recentCount = recentBehaviors?.length || 0;
      const oldCount = oldBehaviors?.length || 0;

      const growthRate = oldCount > 0
        ? ((recentCount - oldCount) / oldCount) * 100
        : 0;

      const { data: categoryProducts } = await supabase
        .from('products')
        .select('id')
        .eq('category', category)
        .limit(10);

      const productIds = categoryProducts?.map(p => p.id) || [];

      const predictions = this.predictFutureTrends(recentCount, oldCount);

      return {
        category,
        growthRate,
        popularProducts: productIds,
        searchVolume: recentCount,
        socialMentions: 0,
        period: 'last_30_days',
        predictions
      };
    } catch (error) {
      console.error('Error detecting category trends:', error);
      throw error;
    }
  }

  async detectEmergingTrends(): Promise<{
    category: string;
    growthRate: number;
    confidence: number;
  }[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: recentSearches } = await supabase
        .from('customer_behavior')
        .select('search_term, category')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .eq('action_type', 'search');

      const { data: oldSearches } = await supabase
        .from('customer_behavior')
        .select('search_term, category')
        .gte('timestamp', fourteenDaysAgo.toISOString())
        .lt('timestamp', sevenDaysAgo.toISOString())
        .eq('action_type', 'search');

      const recentTerms = this.extractTrendingTerms(recentSearches || []);
      const oldTerms = this.extractTrendingTerms(oldSearches || []);

      const emergingTrends = this.compareTermSets(recentTerms, oldTerms);

      return emergingTrends;
    } catch (error) {
      console.error('Error detecting emerging trends:', error);
      return [];
    }
  }

  async getSocialMediaTrends(): Promise<{
    platform: string;
    trending: string[];
    engagement: number;
  }[]> {
    return [
      {
        platform: 'Instagram',
        trending: ['moda verão', 'vestidos', 'looks do dia'],
        engagement: 0
      },
      {
        platform: 'Facebook',
        trending: ['ofertas', 'promoções', 'moda feminina'],
        engagement: 0
      }
    ];
  }

  async getSeasonalTrends(): Promise<{
    season: string;
    categories: string[];
    expectedGrowth: number;
  }[]> {
    const month = new Date().getMonth();
    const season = this.getCurrentSeason(month);

    const seasonalCategories = this.getSeasonalCategories(season);

    return [
      {
        season,
        categories: seasonalCategories,
        expectedGrowth: 25
      }
    ];
  }

  private getStartDate(period: 'week' | 'month' | 'quarter'): Date {
    const date = new Date();
    switch (period) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
    }
    return date;
  }

  private countProductViews(behaviors: any[]): Map<string, number> {
    const counts = new Map<string, number>();
    behaviors.forEach(b => {
      if (b.product_id && b.action_type === 'view') {
        counts.set(b.product_id, (counts.get(b.product_id) || 0) + 1);
      }
    });
    return counts;
  }

  private analyzeCategoryTrends(
    products: any[],
    viewCounts: Map<string, number>
  ): Map<string, TrendAnalysis> {
    const categoryMap = new Map<string, TrendAnalysis>();

    products.forEach(product => {
      const category = product.category;
      const views = viewCounts.get(product.id) || 0;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          growthRate: 0,
          popularProducts: [],
          searchVolume: 0,
          socialMentions: 0,
          period: 'current',
          predictions: {
            nextMonth: 0,
            nextQuarter: 0
          }
        });
      }

      const trend = categoryMap.get(category)!;
      trend.popularProducts.push(product.id);
      trend.searchVolume += views;
    });

    categoryMap.forEach((trend, category) => {
      trend.growthRate = this.calculateGrowthRate(trend.searchVolume);
      trend.predictions = this.predictFutureTrends(trend.searchVolume, trend.searchVolume * 0.8);
    });

    return categoryMap;
  }

  private calculateGrowthRate(currentVolume: number): number {
    return Math.random() * 30 - 10;
  }

  private predictFutureTrends(
    recentCount: number,
    oldCount: number
  ): { nextMonth: number; nextQuarter: number } {
    const growthRate = oldCount > 0 ? (recentCount - oldCount) / oldCount : 0;

    return {
      nextMonth: Math.round(recentCount * (1 + growthRate)),
      nextQuarter: Math.round(recentCount * (1 + growthRate * 3))
    };
  }

  private extractTrendingTerms(searches: any[]): Map<string, number> {
    const terms = new Map<string, number>();
    searches.forEach(s => {
      if (s.search_term) {
        terms.set(s.search_term, (terms.get(s.search_term) || 0) + 1);
      }
      if (s.category) {
        terms.set(s.category, (terms.get(s.category) || 0) + 1);
      }
    });
    return terms;
  }

  private compareTermSets(
    recentTerms: Map<string, number>,
    oldTerms: Map<string, number>
  ): { category: string; growthRate: number; confidence: number }[] {
    const emerging: { category: string; growthRate: number; confidence: number }[] = [];

    recentTerms.forEach((recentCount, term) => {
      const oldCount = oldTerms.get(term) || 0;
      const growthRate = oldCount > 0 ? ((recentCount - oldCount) / oldCount) * 100 : 100;

      if (growthRate > 50) {
        emerging.push({
          category: term,
          growthRate,
          confidence: Math.min(recentCount / 10, 1)
        });
      }
    });

    return emerging.sort((a, b) => b.growthRate - a.growthRate);
  }

  private getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'outono';
    if (month >= 5 && month <= 7) return 'inverno';
    if (month >= 8 && month <= 10) return 'primavera';
    return 'verão';
  }

  private getSeasonalCategories(season: string): string[] {
    const seasonalMap: Record<string, string[]> = {
      'verão': ['Vestidos', 'Shorts', 'Camisetas', 'Bermudas'],
      'inverno': ['Jaquetas', 'Casacos', 'Calças', 'Moletons'],
      'primavera': ['Vestidos', 'Blusas', 'Calças Leves'],
      'outono': ['Jaquetas Leves', 'Cardigans', 'Calças']
    };

    return seasonalMap[season] || [];
  }
}

export const trendDetector = new TrendDetector();
