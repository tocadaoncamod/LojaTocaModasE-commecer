import { supabase } from '../../lib/supabase';
import { InstagramProduct, SocialMediaAccount } from '../../types/social';

export class InstagramService {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';

  async connectAccount(accessToken: string): Promise<SocialMediaAccount> {
    try {
      const response = await fetch(`${this.apiUrl}/me?fields=id,username&access_token=${accessToken}`);

      if (!response.ok) {
        throw new Error('Failed to connect Instagram account');
      }

      const data = await response.json();

      const account: Partial<SocialMediaAccount> = {
        platform: 'instagram',
        accountId: data.id,
        accountName: data.username,
        accessToken,
        isConnected: true,
        lastSync: new Date(),
        settings: {}
      };

      const { data: savedAccount, error } = await supabase
        .from('social_media_accounts')
        .upsert(account)
        .select()
        .single();

      if (error) throw error;

      return savedAccount;
    } catch (error) {
      console.error('Error connecting Instagram account:', error);
      throw error;
    }
  }

  async syncProduct(productId: string, accountId: string): Promise<InstagramProduct> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'instagram')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Instagram account not connected');
      }

      const catalogData = {
        retailer_id: productId,
        name: product.name,
        description: product.description || '',
        price: product.price * 100,
        currency: 'BRL',
        availability: 'in stock',
        image_url: product.image_url,
        url: `${window.location.origin}/product/${productId}`
      };

      const response = await fetch(
        `${this.apiUrl}/${account.settings.catalogId}/products?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catalogData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sync product to Instagram');
      }

      const result = await response.json();

      const instagramProduct: Partial<InstagramProduct> = {
        productId,
        instagramId: result.id,
        catalogId: account.settings.catalogId,
        status: 'active',
        postedAt: new Date()
      };

      const { data: savedProduct, error } = await supabase
        .from('instagram_products')
        .upsert(instagramProduct)
        .select()
        .single();

      if (error) throw error;

      return savedProduct;
    } catch (error) {
      console.error('Error syncing product to Instagram:', error);
      throw error;
    }
  }

  async createShoppingPost(
    accountId: string,
    productIds: string[],
    caption: string,
    imageUrl: string
  ): Promise<string> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'instagram')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Instagram account not connected');
      }

      const products = await Promise.all(
        productIds.map(id => this.getInstagramProductId(id))
      );

      const postData = {
        image_url: imageUrl,
        caption,
        product_tags: products.map(p => ({ product_id: p }))
      };

      const response = await fetch(
        `${this.apiUrl}/${account.account_id}/media?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create Instagram post');
      }

      const result = await response.json();

      await supabase
        .from('social_media_posts')
        .insert({
          platform: 'instagram',
          product_ids: productIds,
          content: caption,
          media_urls: [imageUrl],
          status: 'published',
          published_at: new Date()
        });

      return result.id;
    } catch (error) {
      console.error('Error creating Instagram shopping post:', error);
      throw error;
    }
  }

  async getProductEngagement(productId: string): Promise<InstagramProduct['engagementMetrics']> {
    try {
      const { data: instagramProduct } = await supabase
        .from('instagram_products')
        .select('instagram_id')
        .eq('product_id', productId)
        .single();

      if (!instagramProduct?.instagram_id) {
        return { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 };
      }

      return {
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reach: 0
      };
    } catch (error) {
      console.error('Error getting product engagement:', error);
      return { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 };
    }
  }

  private async getInstagramProductId(productId: string): Promise<string> {
    const { data } = await supabase
      .from('instagram_products')
      .select('instagram_id')
      .eq('product_id', productId)
      .single();

    return data?.instagram_id || '';
  }

  async syncAllProducts(accountId: string): Promise<{ success: number; failed: number }> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('status', 'active')
        .limit(50);

      if (!products) return { success: 0, failed: 0 };

      let success = 0;
      let failed = 0;

      for (const product of products) {
        try {
          await this.syncProduct(product.id, accountId);
          success++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error syncing all products:', error);
      throw error;
    }
  }

  async getAnalytics(accountId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'instagram')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Instagram account not connected');
      }

      return {
        followers: 0,
        engagement: 0,
        reach: 0,
        impressions: 0,
        profileViews: 0
      };
    } catch (error) {
      console.error('Error getting Instagram analytics:', error);
      throw error;
    }
  }

  async schedulePost(
    accountId: string,
    productIds: string[],
    caption: string,
    imageUrl: string,
    scheduledFor: Date
  ): Promise<string> {
    try {
      const { data: post, error } = await supabase
        .from('social_media_posts')
        .insert({
          platform: 'instagram',
          account_id: accountId,
          product_ids: productIds,
          content: caption,
          media_urls: [imageUrl],
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return post.id;
    } catch (error) {
      console.error('Error scheduling Instagram post:', error);
      throw error;
    }
  }
}

export const instagramService = new InstagramService();
