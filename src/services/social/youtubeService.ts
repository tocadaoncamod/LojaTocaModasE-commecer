import { supabase } from '../../lib/supabase';
import { YouTubeVideo, SocialMediaAccount } from '../../types/social';
import { aiVideoGenerator } from '../ai/aiVideoGenerator';

export class YouTubeService {
  private readonly apiUrl = 'https://www.googleapis.com/youtube/v3';

  async connectAccount(accessToken: string): Promise<SocialMediaAccount> {
    try {
      const response = await fetch(
        `${this.apiUrl}/channels?part=snippet&mine=true`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to connect YouTube account');
      }

      const data = await response.json();
      const channel = data.items[0];

      const account: Partial<SocialMediaAccount> = {
        platform: 'youtube',
        accountId: channel.id,
        accountName: channel.snippet.title,
        accessToken,
        isConnected: true,
        lastSync: new Date(),
        settings: {
          channelId: channel.id,
          customUrl: channel.snippet.customUrl
        }
      };

      const { data: savedAccount, error } = await supabase
        .from('social_media_accounts')
        .upsert(account)
        .select()
        .single();

      if (error) throw error;

      return savedAccount;
    } catch (error) {
      console.error('Error connecting YouTube account:', error);
      throw error;
    }
  }

  async uploadProductVideo(
    productId: string,
    accountId: string,
    videoFile?: File
  ): Promise<YouTubeVideo> {
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
        .eq('platform', 'youtube')
        .single();

      if (!account || !account.access_token) {
        throw new Error('YouTube account not connected');
      }

      let videoUrl: string;

      if (videoFile) {
        videoUrl = URL.createObjectURL(videoFile);
      } else {
        videoUrl = await aiVideoGenerator.generateVideoFromProduct(productId);
      }

      const title = `${product.name} - ${product.category}`;
      const description = this.generateVideoDescription(product);
      const tags = this.generateVideoTags(product);

      const metadata = {
        snippet: {
          title,
          description,
          tags,
          categoryId: '22'
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      };

      const youtubeVideo: Partial<YouTubeVideo> = {
        productId,
        title,
        description,
        videoUrl,
        thumbnailUrl: product.image_url,
        status: 'processing'
      };

      const { data: savedVideo, error } = await supabase
        .from('youtube_videos')
        .insert(youtubeVideo)
        .select()
        .single();

      if (error) throw error;

      return savedVideo;
    } catch (error) {
      console.error('Error uploading product video:', error);
      throw error;
    }
  }

  async generateAutomaticVideo(productId: string, accountId: string): Promise<YouTubeVideo> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', productId)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      const videoUrl = await aiVideoGenerator.generateVideoFromProduct(productId);

      const title = `${product.name} - Descubra Agora!`;
      const description = this.generateVideoDescription(product);

      const youtubeVideo: Partial<YouTubeVideo> = {
        productId,
        title,
        description,
        videoUrl,
        thumbnailUrl: product.image_url,
        status: 'draft'
      };

      const { data: savedVideo, error } = await supabase
        .from('youtube_videos')
        .insert(youtubeVideo)
        .select()
        .single();

      if (error) throw error;

      return savedVideo;
    } catch (error) {
      console.error('Error generating automatic video:', error);
      throw error;
    }
  }

  async publishVideo(videoId: string, accountId: string): Promise<void> {
    try {
      const { data: video } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (!video) {
        throw new Error('Video not found');
      }

      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'youtube')
        .single();

      if (!account || !account.access_token) {
        throw new Error('YouTube account not connected');
      }

      await supabase
        .from('youtube_videos')
        .update({
          status: 'published',
          published_at: new Date()
        })
        .eq('id', videoId);
    } catch (error) {
      console.error('Error publishing video:', error);
      throw error;
    }
  }

  async getVideoAnalytics(videoId: string): Promise<YouTubeVideo['metrics']> {
    try {
      const { data: video } = await supabase
        .from('youtube_videos')
        .select('video_id')
        .eq('id', videoId)
        .single();

      if (!video?.video_id) {
        return { views: 0, likes: 0, comments: 0, shares: 0 };
      }

      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      };
    } catch (error) {
      console.error('Error getting video analytics:', error);
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }
  }

  async createProductShorts(productId: string, accountId: string): Promise<YouTubeVideo> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      const videoUrl = await aiVideoGenerator.generateVideoFromProduct(productId, 'modern');

      const title = `${product.name} #shorts`;
      const description = `${product.description}\n\n🛒 Compre agora: ${window.location.origin}/product/${productId}\n\n#moda #fashion #shorts`;

      const youtubeVideo: Partial<YouTubeVideo> = {
        productId,
        title,
        description,
        videoUrl,
        thumbnailUrl: product.image_url,
        status: 'draft'
      };

      const { data: savedVideo, error } = await supabase
        .from('youtube_videos')
        .insert(youtubeVideo)
        .select()
        .single();

      if (error) throw error;

      return savedVideo;
    } catch (error) {
      console.error('Error creating product shorts:', error);
      throw error;
    }
  }

  private generateVideoDescription(product: any): string {
    const baseUrl = window.location.origin;

    return `
${product.name}

${product.description || 'Produto de alta qualidade disponível em nossa loja!'}

💰 Preço: R$ ${product.price.toFixed(2)}
🛒 Compre agora: ${baseUrl}/product/${product.id}

📦 Entrega para todo o Brasil
✅ Garantia de qualidade
🔒 Compra segura

Categoria: ${product.category}

#moda #fashion #${product.category.toLowerCase().replace(' ', '')} #compraronline #lojavirtual
`.trim();
  }

  private generateVideoTags(product: any): string[] {
    return [
      'moda',
      'fashion',
      product.category.toLowerCase(),
      'comprar online',
      'loja virtual',
      'brasil',
      product.name.toLowerCase(),
      'tendência',
      'estilo'
    ];
  }

  async scheduleVideoPublish(videoId: string, publishAt: Date): Promise<void> {
    try {
      await supabase
        .from('youtube_videos')
        .update({
          status: 'scheduled',
          scheduled_for: publishAt.toISOString()
        })
        .eq('id', videoId);
    } catch (error) {
      console.error('Error scheduling video:', error);
      throw error;
    }
  }

  async batchGenerateVideos(productIds: string[], accountId: string): Promise<{
    success: number;
    failed: number;
  }> {
    let success = 0;
    let failed = 0;

    for (const productId of productIds) {
      try {
        await this.generateAutomaticVideo(productId, accountId);
        success++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async updateVideoMetadata(videoId: string, updates: Partial<YouTubeVideo>): Promise<void> {
    try {
      await supabase
        .from('youtube_videos')
        .update(updates)
        .eq('id', videoId);
    } catch (error) {
      console.error('Error updating video metadata:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();
