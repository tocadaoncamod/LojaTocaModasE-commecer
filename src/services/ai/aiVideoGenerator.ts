import { AIVideoConfig } from '../../types/ai';
import { supabase } from '../../lib/supabase';

export class AIVideoGenerator {
  private readonly API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-video-generator`;

  async generateProductVideo(config: AIVideoConfig): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  }> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      return data.video;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  async generateVideoFromProduct(productId: string, style?: AIVideoConfig['style']): Promise<string> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', productId)
        .maybeSingle();

      if (!product) {
        throw new Error('Product not found');
      }

      const images = product.product_images?.map((img: any) => img.image_url) || [product.image_url];

      const config: AIVideoConfig = {
        productId,
        images,
        duration: 15,
        style: style || this.getStyleFromCategory(product.category),
        transitions: ['fade', 'slide', 'zoom']
      };

      const video = await this.generateProductVideo(config);

      await this.saveVideoMetadata(productId, video);

      return video.videoUrl;
    } catch (error) {
      console.error('Error generating video from product:', error);
      throw error;
    }
  }

  async generateBulkVideos(productIds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const productId of productIds) {
      try {
        const videoUrl = await this.generateVideoFromProduct(productId);
        results.set(productId, videoUrl);

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error generating video for ${productId}:`, error);
      }
    }

    return results;
  }

  async generateCollectionVideo(productIds: string[], theme: string): Promise<string> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .in('id', productIds);

      if (!products || products.length === 0) {
        throw new Error('No products found');
      }

      const allImages = products.flatMap(p =>
        p.product_images?.map((img: any) => img.image_url) || [p.image_url]
      );

      const config: AIVideoConfig = {
        productId: 'collection',
        images: allImages,
        duration: 30,
        style: 'modern',
        transitions: ['fade', 'slide', 'zoom', 'crossfade']
      };

      const video = await this.generateProductVideo(config);
      return video.videoUrl;
    } catch (error) {
      console.error('Error generating collection video:', error);
      throw error;
    }
  }

  private getStyleFromCategory(category: string): AIVideoConfig['style'] {
    const styleMap: Record<string, AIVideoConfig['style']> = {
      'Vestidos': 'elegant',
      'Calças': 'modern',
      'Camisetas': 'casual',
      'Esportivo': 'sport'
    };

    return styleMap[category] || 'modern';
  }

  private async saveVideoMetadata(
    productId: string,
    video: { videoUrl: string; thumbnailUrl: string; duration: number }
  ): Promise<void> {
    try {
      await supabase
        .from('product_videos')
        .upsert({
          product_id: productId,
          video_url: video.videoUrl,
          thumbnail_url: video.thumbnailUrl,
          duration: video.duration,
          generated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving video metadata:', error);
    }
  }

  async getProductVideo(productId: string): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('product_videos')
        .select('video_url')
        .eq('product_id', productId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data?.video_url || null;
    } catch (error) {
      console.error('Error fetching product video:', error);
      return null;
    }
  }
}

export const aiVideoGenerator = new AIVideoGenerator();
