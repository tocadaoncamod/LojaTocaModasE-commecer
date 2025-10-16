import { AIProductDescription } from '../../types/ai';
import { supabase } from '../../lib/supabase';

export class AIDescriptionGenerator {
  private readonly API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-description-generator`;

  async generateDescription(
    productName: string,
    category: string,
    images: string[],
    existingData?: Partial<AIProductDescription>
  ): Promise<AIProductDescription> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          category,
          images,
          existingData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Error generating description:', error);
      return this.fallbackDescription(productName, category);
    }
  }

  async generateBulkDescriptions(products: Array<{
    id: string;
    name: string;
    category: string;
    images: string[];
  }>): Promise<Map<string, AIProductDescription>> {
    const results = new Map<string, AIProductDescription>();

    for (const product of products) {
      try {
        const description = await this.generateDescription(
          product.name,
          product.category,
          product.images
        );
        results.set(product.id, description);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating description for ${product.id}:`, error);
        results.set(product.id, this.fallbackDescription(product.name, product.category));
      }
    }

    return results;
  }

  async improveExistingDescription(
    productId: string,
    currentDescription: string
  ): Promise<AIProductDescription> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('name, category, image_url')
        .eq('id', productId)
        .maybeSingle();

      if (!product) {
        throw new Error('Product not found');
      }

      return await this.generateDescription(
        product.name,
        product.category,
        [product.image_url],
        { description: currentDescription }
      );
    } catch (error) {
      console.error('Error improving description:', error);
      throw error;
    }
  }

  private fallbackDescription(productName: string, category: string): AIProductDescription {
    const categoryData = this.getCategoryData(category);

    return {
      title: productName,
      description: `${productName} de alta qualidade, perfeito para quem busca ${categoryData.quality}. Produto confortável e durável.`,
      shortDescription: `${productName} - ${categoryData.quality}`,
      features: categoryData.features,
      tags: [category, ...categoryData.tags],
      keywords: [productName, category, ...categoryData.keywords],
      category,
      targetAudience: categoryData.audience,
      seasonality: categoryData.seasonality
    };
  }

  private getCategoryData(category: string): {
    quality: string;
    features: string[];
    tags: string[];
    keywords: string[];
    audience: string[];
    seasonality: string[];
  } {
    const categoryMap: Record<string, any> = {
      'Calças': {
        quality: 'estilo e conforto',
        features: ['Tecido de qualidade', 'Modelagem perfeita', 'Conforto o dia todo'],
        tags: ['moda', 'estilo', 'conforto'],
        keywords: ['calça', 'fashion', 'tendência'],
        audience: ['jovens', 'adultos', 'profissionais'],
        seasonality: ['ano todo']
      },
      'Camisetas': {
        quality: 'conforto e estilo casual',
        features: ['100% algodão', 'Respirável', 'Lavagem fácil'],
        tags: ['casual', 'básico', 'conforto'],
        keywords: ['camiseta', 't-shirt', 'básico'],
        audience: ['jovens', 'adultos', 'todos'],
        seasonality: ['ano todo', 'verão']
      },
      'Vestidos': {
        quality: 'elegância e feminilidade',
        features: ['Design exclusivo', 'Tecido nobre', 'Caimento impecável'],
        tags: ['elegante', 'feminino', 'festa'],
        keywords: ['vestido', 'elegância', 'moda feminina'],
        audience: ['mulheres', 'jovens', 'senhoras'],
        seasonality: ['ano todo', 'festas']
      },
      'Blusas': {
        quality: 'versatilidade e estilo',
        features: ['Múltiplas combinações', 'Tecido confortável', 'Design moderno'],
        tags: ['versátil', 'moderno', 'trabalho'],
        keywords: ['blusa', 'casual', 'trabalho'],
        audience: ['mulheres', 'profissionais'],
        seasonality: ['ano todo']
      }
    };

    return categoryMap[category] || {
      quality: 'qualidade e estilo',
      features: ['Alta qualidade', 'Design moderno', 'Conforto garantido'],
      tags: ['moda', 'estilo'],
      keywords: ['produto', 'moda', 'qualidade'],
      audience: ['todos'],
      seasonality: ['ano todo']
    };
  }

  async saveDescription(productId: string, description: AIProductDescription): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          description: description.description,
          tags: description.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      await supabase
        .from('product_ai_metadata')
        .upsert({
          product_id: productId,
          ai_description: description,
          generated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving description:', error);
      throw error;
    }
  }
}

export const aiDescriptionGenerator = new AIDescriptionGenerator();
