import { supabase } from '../../lib/supabase';

export class TagSuggester {
  async suggestTags(
    productName: string,
    category: string,
    description?: string,
    imageUrl?: string
  ): Promise<{
    tags: string[];
    keywords: string[];
    seoMetadata: {
      title: string;
      description: string;
      keywords: string[];
    };
  }> {
    try {
      const baseTags = this.extractBaseTags(productName, category);

      const categoryTags = this.getCategorySpecificTags(category);

      const descriptionTags = description
        ? this.extractTagsFromDescription(description)
        : [];

      const trendingTags = await this.getTrendingTags(category);

      const allTags = [
        ...baseTags,
        ...categoryTags,
        ...descriptionTags,
        ...trendingTags
      ];

      const uniqueTags = [...new Set(allTags)].slice(0, 15);

      const keywords = this.generateKeywords(productName, category, uniqueTags);

      const seoMetadata = this.generateSEOMetadata(productName, category, uniqueTags);

      return {
        tags: uniqueTags,
        keywords,
        seoMetadata
      };
    } catch (error) {
      console.error('Error suggesting tags:', error);
      throw error;
    }
  }

  async suggestKeywordsForSearch(searchTerm: string): Promise<string[]> {
    try {
      const { data: searches } = await supabase
        .from('customer_behavior')
        .select('search_term')
        .eq('action_type', 'search')
        .ilike('search_term', `%${searchTerm}%`)
        .limit(10);

      const relatedSearches = searches?.map(s => s.search_term) || [];

      const suggestions = [
        ...relatedSearches,
        ...this.generateSearchSuggestions(searchTerm)
      ];

      return [...new Set(suggestions)].slice(0, 8);
    } catch (error) {
      console.error('Error suggesting keywords:', error);
      return [];
    }
  }

  async improveProductSEO(productId: string): Promise<{
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedTags: string[];
    suggestedKeywords: string[];
  }> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (!product) {
        throw new Error('Product not found');
      }

      const suggestions = await this.suggestTags(
        product.name,
        product.category,
        product.description,
        product.image_url
      );

      const improvedTitle = this.optimizeTitleForSEO(product.name, suggestions.keywords);
      const improvedDescription = this.optimizeDescriptionForSEO(
        product.description || product.name,
        suggestions.keywords
      );

      return {
        suggestedTitle: improvedTitle,
        suggestedDescription: improvedDescription,
        suggestedTags: suggestions.tags,
        suggestedKeywords: suggestions.keywords
      };
    } catch (error) {
      console.error('Error improving product SEO:', error);
      throw error;
    }
  }

  private extractBaseTags(productName: string, category: string): string[] {
    const tags = [category];

    const words = productName.toLowerCase().split(/\s+/);

    const colorKeywords = ['azul', 'vermelho', 'verde', 'preto', 'branco', 'rosa', 'amarelo'];
    const styleKeywords = ['casual', 'elegante', 'esportivo', 'básico', 'premium', 'moderno'];
    const sizeKeywords = ['grande', 'pequeno', 'médio', 'plus size', 'slim', 'fit'];

    words.forEach(word => {
      if (colorKeywords.includes(word)) tags.push(word);
      if (styleKeywords.includes(word)) tags.push(word);
      if (sizeKeywords.includes(word)) tags.push(word);
    });

    return tags;
  }

  private getCategorySpecificTags(category: string): string[] {
    const categoryTagsMap: Record<string, string[]> = {
      'Calças': ['moda', 'fashion', 'tendência', 'conforto', 'estilo'],
      'Camisetas': ['básico', 'casual', 'algodão', 'confortável', 'versátil'],
      'Vestidos': ['feminino', 'elegante', 'festa', 'casual', 'chic'],
      'Blusas': ['feminino', 'trabalho', 'casual', 'moderno', 'versátil'],
      'Jaquetas': ['inverno', 'estilo', 'proteção', 'moda', 'tendência'],
      'Shorts': ['verão', 'casual', 'conforto', 'praia', 'lazer'],
      'Sapatos': ['calçado', 'conforto', 'estilo', 'durável', 'moda']
    };

    return categoryTagsMap[category] || ['moda', 'estilo', 'tendência'];
  }

  private extractTagsFromDescription(description: string): string[] {
    const keywords = [
      'premium', 'luxo', 'confortável', 'durável', 'elegante',
      'moderno', 'clássico', 'versátil', 'exclusivo', 'sofisticado'
    ];

    const descLower = description.toLowerCase();
    return keywords.filter(keyword => descLower.includes(keyword));
  }

  private async getTrendingTags(category: string): Promise<string[]> {
    try {
      const { data: trendingProducts } = await supabase
        .from('products')
        .select('tags')
        .eq('category', category)
        .limit(20);

      if (!trendingProducts) return [];

      const allTags = trendingProducts.flatMap(p => p.tags || []);

      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);
    } catch (error) {
      console.error('Error getting trending tags:', error);
      return [];
    }
  }

  private generateKeywords(productName: string, category: string, tags: string[]): string[] {
    const keywords = [
      productName.toLowerCase(),
      category.toLowerCase(),
      ...tags.map(t => t.toLowerCase())
    ];

    const variations = [
      `${productName} online`,
      `comprar ${productName}`,
      `${productName} barato`,
      `${category} feminino`,
      `${category} masculino`,
      `melhor ${productName}`
    ];

    return [...keywords, ...variations].slice(0, 20);
  }

  private generateSEOMetadata(
    productName: string,
    category: string,
    tags: string[]
  ): {
    title: string;
    description: string;
    keywords: string[];
  } {
    const title = `${productName} - ${category} | Loja Online`;

    const description = `Compre ${productName} na nossa loja online. ${tags.slice(0, 3).join(', ')}. Entrega rápida e segura. Melhores preços e qualidade garantida.`;

    const keywords = [
      productName,
      category,
      ...tags,
      'moda online',
      'comprar online',
      'loja virtual'
    ];

    return {
      title: title.slice(0, 60),
      description: description.slice(0, 160),
      keywords: keywords.slice(0, 15)
    };
  }

  private optimizeTitleForSEO(title: string, keywords: string[]): string {
    const primaryKeyword = keywords[0] || '';

    if (title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      return title;
    }

    return `${title} - ${primaryKeyword}`;
  }

  private optimizeDescriptionForSEO(description: string, keywords: string[]): string {
    let optimized = description;

    const topKeywords = keywords.slice(0, 3);

    topKeywords.forEach(keyword => {
      if (!optimized.toLowerCase().includes(keyword.toLowerCase())) {
        optimized += ` ${keyword}`;
      }
    });

    return optimized;
  }

  private generateSearchSuggestions(searchTerm: string): string[] {
    const term = searchTerm.toLowerCase();

    const prefixes = ['melhor', 'comprar', 'barato', 'promoção'];
    const suffixes = ['online', 'barato', 'promoção', 'oferta', 'desconto'];

    const suggestions = [
      ...prefixes.map(p => `${p} ${term}`),
      ...suffixes.map(s => `${term} ${s}`)
    ];

    return suggestions;
  }

  async analyzeSEOPerformance(productId: string): Promise<{
    score: number;
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
  }> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (!product) {
        throw new Error('Product not found');
      }

      let score = 0;
      const suggestions: string[] = [];
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (product.name && product.name.length >= 10 && product.name.length <= 60) {
        score += 20;
        strengths.push('Título com tamanho adequado');
      } else {
        suggestions.push('Ajustar tamanho do título (10-60 caracteres)');
        weaknesses.push('Título muito curto ou muito longo');
      }

      if (product.description && product.description.length >= 50) {
        score += 20;
        strengths.push('Descrição detalhada');
      } else {
        suggestions.push('Adicionar descrição mais detalhada (mínimo 50 caracteres)');
        weaknesses.push('Descrição muito curta');
      }

      if (product.tags && product.tags.length >= 3) {
        score += 20;
        strengths.push('Bom número de tags');
      } else {
        suggestions.push('Adicionar mais tags relevantes (mínimo 3)');
        weaknesses.push('Poucas tags');
      }

      if (product.image_url) {
        score += 20;
        strengths.push('Produto com imagem');
      } else {
        suggestions.push('Adicionar imagem do produto');
        weaknesses.push('Sem imagem');
      }

      score += 20;
      strengths.push('Produto ativo na loja');

      return {
        score,
        suggestions,
        strengths,
        weaknesses
      };
    } catch (error) {
      console.error('Error analyzing SEO performance:', error);
      throw error;
    }
  }
}

export const tagSuggester = new TagSuggester();
