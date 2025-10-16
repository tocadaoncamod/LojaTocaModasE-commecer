import { supabase } from '../../lib/supabase';
import { FacebookProduct, SocialMediaAccount } from '../../types/social';

export class FacebookService {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';

  async connectAccount(accessToken: string, pageId: string): Promise<SocialMediaAccount> {
    try {
      const response = await fetch(
        `${this.apiUrl}/${pageId}?fields=id,name,access_token&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to connect Facebook account');
      }

      const data = await response.json();

      const account: Partial<SocialMediaAccount> = {
        platform: 'facebook',
        accountId: data.id,
        accountName: data.name,
        accessToken: data.access_token || accessToken,
        isConnected: true,
        lastSync: new Date(),
        settings: { pageId }
      };

      const { data: savedAccount, error } = await supabase
        .from('social_media_accounts')
        .upsert(account)
        .select()
        .single();

      if (error) throw error;

      return savedAccount;
    } catch (error) {
      console.error('Error connecting Facebook account:', error);
      throw error;
    }
  }

  async createCatalog(accountId: string, catalogName: string): Promise<string> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'facebook')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Facebook account not connected');
      }

      const response = await fetch(
        `${this.apiUrl}/${account.account_id}/product_catalogs?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catalogName })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create catalog');
      }

      const result = await response.json();

      await supabase
        .from('social_media_accounts')
        .update({ settings: { ...account.settings, catalogId: result.id } })
        .eq('id', accountId);

      return result.id;
    } catch (error) {
      console.error('Error creating Facebook catalog:', error);
      throw error;
    }
  }

  async syncProduct(productId: string, accountId: string): Promise<FacebookProduct> {
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
        .eq('platform', 'facebook')
        .single();

      if (!account || !account.access_token || !account.settings?.catalogId) {
        throw new Error('Facebook account or catalog not configured');
      }

      const productData = {
        retailer_id: productId,
        name: product.name,
        description: product.description || '',
        price: product.price * 100,
        currency: 'BRL',
        availability: 'in stock',
        condition: 'new',
        image_url: product.image_url,
        url: `${window.location.origin}/product/${productId}`,
        brand: 'Loja',
        category: product.category
      };

      const response = await fetch(
        `${this.apiUrl}/${account.settings.catalogId}/products?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to sync product: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();

      const facebookProduct: Partial<FacebookProduct> = {
        productId,
        facebookId: result.id,
        catalogId: account.settings.catalogId,
        status: 'active'
      };

      const { data: savedProduct, error } = await supabase
        .from('facebook_products')
        .upsert(facebookProduct)
        .select()
        .single();

      if (error) throw error;

      return savedProduct;
    } catch (error) {
      console.error('Error syncing product to Facebook:', error);
      throw error;
    }
  }

  async createShopPost(
    accountId: string,
    productIds: string[],
    message: string,
    imageUrl?: string
  ): Promise<string> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'facebook')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Facebook account not connected');
      }

      const postData: any = {
        message,
        published: true
      };

      if (imageUrl) {
        postData.url = imageUrl;
      }

      const products = await Promise.all(
        productIds.map(id => this.getFacebookProductId(id))
      );

      if (products.length > 0) {
        postData.product_tags = products.map(p => ({ id: p }));
      }

      const response = await fetch(
        `${this.apiUrl}/${account.settings.pageId}/feed?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create Facebook post');
      }

      const result = await response.json();

      await supabase
        .from('social_media_posts')
        .insert({
          platform: 'facebook',
          product_ids: productIds,
          content: message,
          media_urls: imageUrl ? [imageUrl] : [],
          status: 'published',
          published_at: new Date()
        });

      return result.id;
    } catch (error) {
      console.error('Error creating Facebook shop post:', error);
      throw error;
    }
  }

  private async getFacebookProductId(productId: string): Promise<string> {
    const { data } = await supabase
      .from('facebook_products')
      .select('facebook_id')
      .eq('product_id', productId)
      .single();

    return data?.facebook_id || '';
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

  async getPageInsights(accountId: string): Promise<any> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'facebook')
        .single();

      if (!account || !account.access_token) {
        throw new Error('Facebook account not connected');
      }

      const metrics = ['page_fans', 'page_engaged_users', 'page_impressions', 'page_post_engagements'];

      const response = await fetch(
        `${this.apiUrl}/${account.settings.pageId}/insights?metric=${metrics.join(',')}&access_token=${account.access_token}`
      );

      if (!response.ok) {
        throw new Error('Failed to get page insights');
      }

      const result = await response.json();

      return result.data;
    } catch (error) {
      console.error('Error getting Facebook insights:', error);
      return [];
    }
  }

  async schedulePost(
    accountId: string,
    productIds: string[],
    message: string,
    imageUrl: string,
    scheduledFor: Date
  ): Promise<string> {
    try {
      const { data: post, error } = await supabase
        .from('social_media_posts')
        .insert({
          platform: 'facebook',
          account_id: accountId,
          product_ids: productIds,
          content: message,
          media_urls: [imageUrl],
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return post.id;
    } catch (error) {
      console.error('Error scheduling Facebook post:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<FacebookProduct>): Promise<void> {
    try {
      const { data: facebookProduct } = await supabase
        .from('facebook_products')
        .select('*, social_media_accounts!inner(*)')
        .eq('product_id', productId)
        .single();

      if (!facebookProduct) {
        throw new Error('Product not synced to Facebook');
      }

      const account = facebookProduct.social_media_accounts;

      const response = await fetch(
        `${this.apiUrl}/${facebookProduct.facebook_id}?access_token=${account.access_token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update Facebook product');
      }

      await supabase
        .from('facebook_products')
        .update(updates)
        .eq('product_id', productId);
    } catch (error) {
      console.error('Error updating Facebook product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const { data: facebookProduct } = await supabase
        .from('facebook_products')
        .select('*, social_media_accounts!inner(*)')
        .eq('product_id', productId)
        .single();

      if (!facebookProduct) return;

      const account = facebookProduct.social_media_accounts;

      await fetch(
        `${this.apiUrl}/${facebookProduct.facebook_id}?access_token=${account.access_token}`,
        { method: 'DELETE' }
      );

      await supabase
        .from('facebook_products')
        .update({ status: 'deleted' })
        .eq('product_id', productId);
    } catch (error) {
      console.error('Error deleting Facebook product:', error);
      throw error;
    }
  }
}

export const facebookService = new FacebookService();
