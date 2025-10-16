import { CampaignSuggestion } from '../../types/ai';
import { supabase } from '../../lib/supabase';
import { trendDetector } from './trendDetector';
import { behaviorAnalyzer } from './behaviorAnalyzer';

export class CampaignAutomation {
  async generateCampaignSuggestions(): Promise<CampaignSuggestion[]> {
    try {
      const suggestions: CampaignSuggestion[] = [];

      const seasonalCampaigns = await this.suggestSeasonalCampaigns();
      suggestions.push(...seasonalCampaigns);

      const performanceCampaigns = await this.suggestPerformanceBasedCampaigns();
      suggestions.push(...performanceCampaigns);

      const inventoryCampaigns = await this.suggestInventoryClearanceCampaigns();
      suggestions.push(...inventoryCampaigns);

      const bundleCampaigns = await this.suggestBundleCampaigns();
      suggestions.push(...bundleCampaigns);

      return suggestions.sort((a, b) => b.expectedRevenue - a.expectedRevenue);
    } catch (error) {
      console.error('Error generating campaign suggestions:', error);
      return [];
    }
  }

  private async suggestSeasonalCampaigns(): Promise<CampaignSuggestion[]> {
    try {
      const seasonalTrends = await trendDetector.getSeasonalTrends();

      const campaigns: CampaignSuggestion[] = [];

      for (const trend of seasonalTrends) {
        const { data: products } = await supabase
          .from('products')
          .select('id, price')
          .in('category', trend.categories)
          .limit(20);

        if (!products || products.length === 0) continue;

        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
        const expectedRevenue = avgPrice * products.length * 0.3;

        campaigns.push({
          type: 'seasonal',
          targetProducts: products.map(p => p.id),
          targetAudience: ['todos', 'clientes ativos'],
          suggestedDiscount: 15,
          expectedRevenue,
          confidence: 0.85,
          duration: 14,
          channels: ['email', 'whatsapp', 'redes sociais']
        });
      }

      return campaigns;
    } catch (error) {
      console.error('Error suggesting seasonal campaigns:', error);
      return [];
    }
  }

  private async suggestPerformanceBasedCampaigns(): Promise<CampaignSuggestion[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: lowPerformers } = await supabase
        .from('products')
        .select('id, price, category')
        .eq('status', 'active')
        .limit(50);

      if (!lowPerformers || lowPerformers.length === 0) return [];

      const { data: viewCounts } = await supabase
        .from('customer_behavior')
        .select('product_id, COUNT(*) as views')
        .in('product_id', lowPerformers.map(p => p.id))
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .eq('action_type', 'view');

      const viewMap = new Map(
        viewCounts?.map(vc => [vc.product_id, vc.views]) || []
      );

      const underperformingProducts = lowPerformers.filter(
        p => (viewMap.get(p.id) || 0) < 10
      );

      if (underperformingProducts.length < 3) return [];

      const avgPrice = underperformingProducts.reduce((sum, p) => sum + p.price, 0) / underperformingProducts.length;
      const expectedRevenue = avgPrice * underperformingProducts.length * 0.4;

      return [
        {
          type: 'discount',
          targetProducts: underperformingProducts.map(p => p.id),
          targetAudience: ['todos', 'visitantes recentes'],
          suggestedDiscount: 25,
          expectedRevenue,
          confidence: 0.75,
          duration: 7,
          channels: ['email', 'banner site', 'redes sociais']
        }
      ];
    } catch (error) {
      console.error('Error suggesting performance-based campaigns:', error);
      return [];
    }
  }

  private async suggestInventoryClearanceCampaigns(): Promise<CampaignSuggestion[]> {
    try {
      const { data: oldProducts } = await supabase
        .from('products')
        .select('id, price, category, created_at')
        .eq('status', 'active')
        .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(30);

      if (!oldProducts || oldProducts.length < 5) return [];

      const avgPrice = oldProducts.reduce((sum, p) => sum + p.price, 0) / oldProducts.length;
      const expectedRevenue = avgPrice * oldProducts.length * 0.5;

      return [
        {
          type: 'clearance',
          targetProducts: oldProducts.map(p => p.id),
          targetAudience: ['clientes de desconto', 'todos'],
          suggestedDiscount: 35,
          expectedRevenue,
          confidence: 0.9,
          duration: 10,
          channels: ['email', 'whatsapp', 'banner site', 'redes sociais']
        }
      ];
    } catch (error) {
      console.error('Error suggesting clearance campaigns:', error);
      return [];
    }
  }

  private async suggestBundleCampaigns(): Promise<CampaignSuggestion[]> {
    try {
      const { data: popularProducts } = await supabase
        .from('products')
        .select('id, price, category')
        .eq('status', 'active')
        .limit(20);

      if (!popularProducts || popularProducts.length < 3) return [];

      const bundles: CampaignSuggestion[] = [];

      const categoryGroups = this.groupByCategory(popularProducts);

      for (const [category, products] of categoryGroups.entries()) {
        if (products.length < 2) continue;

        const bundleProducts = products.slice(0, 3);
        const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
        const expectedRevenue = totalPrice * 0.85 * 2;

        bundles.push({
          type: 'bundle',
          targetProducts: bundleProducts.map(p => p.id),
          targetAudience: ['clientes de ' + category, 'todos'],
          suggestedDiscount: 15,
          expectedRevenue,
          confidence: 0.8,
          duration: 14,
          channels: ['email', 'banner site']
        });
      }

      return bundles;
    } catch (error) {
      console.error('Error suggesting bundle campaigns:', error);
      return [];
    }
  }

  async createAutomatedCampaign(suggestion: CampaignSuggestion): Promise<string> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          type: suggestion.type,
          name: this.generateCampaignName(suggestion),
          discount_percentage: suggestion.suggestedDiscount,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + suggestion.duration * 24 * 60 * 60 * 1000).toISOString(),
          target_products: suggestion.targetProducts,
          target_audience: suggestion.targetAudience,
          channels: suggestion.channels,
          expected_revenue: suggestion.expectedRevenue,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return campaign.id;
    } catch (error) {
      console.error('Error creating automated campaign:', error);
      throw error;
    }
  }

  async monitorCampaignPerformance(campaignId: string): Promise<{
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
  }> {
    try {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const { data: behaviors } = await supabase
        .from('customer_behavior')
        .select('action_type, product_id')
        .in('product_id', campaign.target_products)
        .gte('timestamp', campaign.start_date);

      const views = behaviors?.filter(b => b.action_type === 'view').length || 0;
      const clicks = behaviors?.filter(b => b.action_type === 'click').length || 0;

      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', campaign.start_date);

      const conversions = orders?.length || 0;
      const revenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;

      const cost = campaign.expected_revenue * 0.1;
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

      return {
        views,
        clicks,
        conversions,
        revenue,
        roi
      };
    } catch (error) {
      console.error('Error monitoring campaign performance:', error);
      throw error;
    }
  }

  async optimizeCampaign(campaignId: string): Promise<{
    newDiscount: number;
    newTargetAudience: string[];
    suggestions: string[];
  }> {
    try {
      const performance = await this.monitorCampaignPerformance(campaignId);

      const suggestions: string[] = [];
      let newDiscount = 0;
      let newTargetAudience: string[] = [];

      if (performance.conversions < 5) {
        newDiscount = Math.min(50, newDiscount + 10);
        suggestions.push('Aumentar desconto para melhorar conversões');
      }

      if (performance.clicks < performance.views * 0.1) {
        suggestions.push('Melhorar chamada para ação e imagens');
      }

      if (performance.roi < 100) {
        suggestions.push('Reduzir custos de marketing ou ajustar público-alvo');
        newTargetAudience = ['clientes fiéis', 'compradores frequentes'];
      }

      return {
        newDiscount,
        newTargetAudience,
        suggestions
      };
    } catch (error) {
      console.error('Error optimizing campaign:', error);
      throw error;
    }
  }

  private groupByCategory(products: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    products.forEach(product => {
      const category = product.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(product);
    });

    return groups;
  }

  private generateCampaignName(suggestion: CampaignSuggestion): string {
    const typeNames = {
      discount: 'Desconto Especial',
      bundle: 'Combo Promocional',
      seasonal: 'Promoção de Temporada',
      clearance: 'Liquidação'
    };

    const baseName = typeNames[suggestion.type];
    const date = new Date().toLocaleDateString('pt-BR');

    return `${baseName} - ${date}`;
  }
}

export const campaignAutomation = new CampaignAutomation();
