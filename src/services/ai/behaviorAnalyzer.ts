import { CustomerBehavior, ProductRecommendation } from '../../types/ai';
import { supabase } from '../../lib/supabase';

export class BehaviorAnalyzer {
  async trackProductView(userId: string, productId: string): Promise<void> {
    try {
      await supabase
        .from('customer_behavior')
        .insert({
          user_id: userId,
          product_id: productId,
          action_type: 'view',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  async trackSearch(userId: string, searchTerm: string): Promise<void> {
    try {
      await supabase
        .from('customer_behavior')
        .insert({
          user_id: userId,
          action_type: 'search',
          search_term: searchTerm,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  async trackCategoryClick(userId: string, category: string): Promise<void> {
    try {
      await supabase
        .from('customer_behavior')
        .insert({
          user_id: userId,
          action_type: 'category_click',
          category,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking category click:', error);
    }
  }

  async trackPurchase(userId: string, productIds: string[], orderTotal: number): Promise<void> {
    try {
      for (const productId of productIds) {
        await supabase
          .from('customer_behavior')
          .insert({
            user_id: userId,
            product_id: productId,
            action_type: 'purchase',
            order_value: orderTotal / productIds.length,
            timestamp: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }

  async getCustomerBehavior(userId: string): Promise<CustomerBehavior> {
    try {
      const { data: behaviors } = await supabase
        .from('customer_behavior')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      const viewedProducts = behaviors
        ?.filter(b => b.action_type === 'view')
        .map(b => b.product_id)
        .filter(Boolean) || [];

      const purchasedProducts = behaviors
        ?.filter(b => b.action_type === 'purchase')
        .map(b => b.product_id)
        .filter(Boolean) || [];

      const searchTerms = behaviors
        ?.filter(b => b.action_type === 'search')
        .map(b => b.search_term)
        .filter(Boolean) || [];

      const clickedCategories = behaviors
        ?.filter(b => b.action_type === 'category_click')
        .map(b => b.category)
        .filter(Boolean) || [];

      return {
        userId,
        viewedProducts: [...new Set(viewedProducts)],
        purchasedProducts: [...new Set(purchasedProducts)],
        searchTerms: [...new Set(searchTerms)],
        clickedCategories: [...new Set(clickedCategories)],
        timeOnSite: 0,
        deviceType: 'desktop',
        referralSource: 'direct',
        lastActivity: new Date()
      };
    } catch (error) {
      console.error('Error getting customer behavior:', error);
      throw error;
    }
  }

  async analyzeCustomerSegment(userId: string): Promise<{
    segment: string;
    characteristics: string[];
    preferredCategories: string[];
    averageOrderValue: number;
  }> {
    try {
      const behavior = await this.getCustomerBehavior(userId);

      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('customer_id', userId);

      const averageOrderValue = orders && orders.length > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
        : 0;

      const categoryFrequency = behavior.clickedCategories.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const preferredCategories = Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

      let segment = 'casual';
      const characteristics: string[] = [];

      if (averageOrderValue > 500) {
        segment = 'premium';
        characteristics.push('Alto valor de compra');
      } else if (averageOrderValue > 200) {
        segment = 'medium';
        characteristics.push('Valor médio de compra');
      }

      if (behavior.purchasedProducts.length > 5) {
        characteristics.push('Cliente frequente');
      }

      if (behavior.viewedProducts.length > behavior.purchasedProducts.length * 10) {
        characteristics.push('Pesquisa muito antes de comprar');
      }

      return {
        segment,
        characteristics,
        preferredCategories,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error analyzing customer segment:', error);
      throw error;
    }
  }

  async getSocialMediaBehavior(userId: string): Promise<{
    platforms: string[];
    engagement: number;
    influenceScore: number;
  }> {
    return {
      platforms: ['Instagram', 'Facebook'],
      engagement: 0,
      influenceScore: 0
    };
  }

  async trackSocialMediaInteraction(
    userId: string,
    platform: string,
    action: string,
    productId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('social_media_interactions')
        .insert({
          user_id: userId,
          platform,
          action,
          product_id: productId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking social media interaction:', error);
    }
  }
}

export const behaviorAnalyzer = new BehaviorAnalyzer();
