import { supabase } from '../lib/supabase';
import { Supplier, SupplierProduct, CatalogSyncResult } from '../types/supplier';

export class SupplierService {
  // Extrair informações básicas do fornecedor pela URL
  static async extractSupplierInfo(vendizapUrl: string): Promise<{
    name: string;
    description: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    totalProducts: number;
  }> {
    try {
      console.log('🔍 Extraindo informações do fornecedor:', vendizapUrl);
      
      // Tentar fazer scraping real da página
      let supplierData;
      
      try {
        // Fazer requisição para a página do fornecedor
        const response = await fetch(vendizapUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          
          // Extrair dados da página HTML
          const extractedData = this.parseVendizapPage(html, vendizapUrl);
          if (extractedData) {
            return extractedData;
          }
        }
      } catch (fetchError) {
        console.log('Erro no fetch, usando dados mock:', fetchError);
      }
      
      // Fallback: Extrair nome do fornecedor da URL
      const urlParts = vendizapUrl.replace('https://', '').replace('http://', '').split('.');
      const supplierSlug = urlParts[0];
      
      // Simular extração de dados (em produção seria web scraping real)
      const mockSupplierData = {
        'vendedorbernardos': {
          name: 'Vendedor Bernardos',
          description: 'Fornecedor especializado em moda masculina, feminina e infantil com preços competitivos',
          phone: '(11) 98765-4321',
          whatsapp: '5511987654321',
          email: 'vendedorbernardos@gmail.com',
          totalProducts: 150
        },
        'modafashion': {
          name: 'Moda Fashion',
          description: 'Atacadista de roupas da moda com variedade em todos os segmentos',
          phone: '(11) 97654-3210',
          whatsapp: '5511976543210',
          email: 'contato@modafashion.com.br',
          totalProducts: 200
        },
        'roupasecia': {
          name: 'Roupas & Cia',
          description: 'Fornecedor de roupas no atacado com foco em qualidade e preço justo',
          phone: '(11) 96543-2109',
          whatsapp: '5511965432109',
          email: 'vendas@roupasecia.com.br',
          totalProducts: 120
        }
      };

      // Buscar dados do fornecedor ou usar dados genéricos
      supplierData = mockSupplierData[supplierSlug as keyof typeof mockSupplierData] || {
        name: supplierSlug.charAt(0).toUpperCase() + supplierSlug.slice(1).replace(/([A-Z])/g, ' $1'),
        description: 'Fornecedor de moda no atacado e varejo',
        phone: '(11) 95432-1098',
        whatsapp: '5511954321098',
        email: 'contato@fornecedor.com.br',
        totalProducts: 100
      };

      return supplierData;
    } catch (error) {
      console.error('Erro ao extrair informações do fornecedor:', error);
      throw new Error('Falha na extração das informações');
    }
  }

  // Função para fazer parsing da página HTML do Vendizap
  static parseVendizapPage(html: string, url: string): {
    name: string;
    description: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    totalProducts: number;
  } | null {
    try {
      // Criar um parser DOM temporário
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extrair nome da loja (geralmente no title ou h1)
      let name = '';
      const titleElement = doc.querySelector('title');
      const h1Element = doc.querySelector('h1');
      const storeNameElement = doc.querySelector('[class*="store"], [class*="loja"], [class*="name"]');
      
      if (storeNameElement?.textContent) {
        name = storeNameElement.textContent.trim();
      } else if (h1Element?.textContent) {
        name = h1Element.textContent.trim();
      } else if (titleElement?.textContent) {
        name = titleElement.textContent.split('-')[0].trim();
      }
      
      // 🎯 EXTRAÇÃO PRIORITÁRIA DO WHATSAPP DOS LINKS
      let phone = '';
      let whatsapp = '';
      let email = '';
      
      // 1. 📱 BUSCAR TODOS OS LINKS DE WHATSAPP NA PÁGINA
      const whatsappSelectors = [
        'a[href*="wa.me"]',
        'a[href*="whatsapp.com"]', 
        'a[href*="api.whatsapp.com"]',
        'a[href*="web.whatsapp.com"]',
        'a[href*="chat.whatsapp.com"]',
        '[onclick*="wa.me"]',
        '[onclick*="whatsapp"]',
        'button[onclick*="whatsapp"]'
      ];
      
      const whatsappLinks = doc.querySelectorAll(whatsappSelectors.join(', '));
      
      console.log(`🔍 Encontrados ${whatsappLinks.length} links de WhatsApp na página`);
      
      if (whatsappLinks.length > 0) {
        for (const link of whatsappLinks) {
          const href = link.getAttribute('href') || '';
          const onclick = link.getAttribute('onclick') || '';
          const linkText = href + ' ' + onclick;
          
          console.log(`🔗 Analisando link: ${linkText}`);
          
          // 📱 PADRÕES DE EXTRAÇÃO DE WHATSAPP
          const patterns = [
            /wa\.me\/(\d{10,15})/,                    // wa.me/5511999999999
            /whatsapp\.com\/send\?phone=(\d{10,15})/, // whatsapp.com/send?phone=5511999999999
            /api\.whatsapp\.com\/send\?phone=(\d{10,15})/, // api.whatsapp.com/send?phone=5511999999999
            /web\.whatsapp\.com\/send\?phone=(\d{10,15})/, // web.whatsapp.com/send?phone=5511999999999
            /chat\.whatsapp\.com\/(\d{10,15})/,       // chat.whatsapp.com/5511999999999
            /phone=(\d{10,15})/,                      // qualquer phone=numero
            /whatsapp.*?(\d{11,15})/i,                // texto com whatsapp + numero
            /(\d{13,15})/                             // numero longo (com codigo pais)
          ];
          
          for (const pattern of patterns) {
            const match = linkText.match(pattern);
            if (match && match[1]) {
              const extractedNumber = match[1];
              
              // ✅ VALIDAR SE É UM NÚMERO VÁLIDO
              if (extractedNumber.length >= 10 && extractedNumber.length <= 15) {
                whatsapp = extractedNumber;
                console.log(`✅ WhatsApp extraído: ${whatsapp} (padrão: ${pattern})`);
                break;
              }
            }
          }
          
          // Se encontrou WhatsApp, parar de procurar
          if (whatsapp) {
            break;
          }
        }
      }
      
      // 2. 📞 SE NÃO ENCONTROU, BUSCAR NO TEXTO DA PÁGINA
      if (!whatsapp) {
        console.log('🔍 Buscando WhatsApp no texto da página...');
        
        // Buscar por texto que contenha "whatsapp" + número
        const whatsappTextPatterns = [
          /whatsapp[^0-9]*(\d{10,15})/gi,
          /zap[^0-9]*(\d{10,15})/gi,
          /wpp[^0-9]*(\d{10,15})/gi
        ];
        
        for (const pattern of whatsappTextPatterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 0) {
            const numbers = matches[0].replace(/\D/g, '');
            if (numbers.length >= 10) {
              whatsapp = numbers;
              console.log(`✅ WhatsApp extraído do texto: ${whatsapp}`);
              break;
            }
          }
        }
      }
      
      // 3. 📞 BUSCAR TELEFONE COMUM
      const phoneRegex = /(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/g;
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      
      const phoneMatches = html.match(phoneRegex);
      const emailMatches = html.match(emailRegex);
      
      if (phoneMatches && phoneMatches.length > 0) {
        phone = phoneMatches[0];
      }
      
      // 4. 📧 BUSCAR EMAIL EM LINKS MAILTO
      const emailLinks = doc.querySelectorAll('a[href^="mailto:"]');
      if (emailLinks.length > 0) {
        const emailHref = emailLinks[0].getAttribute('href') || '';
        const emailFromLink = emailHref.replace('mailto:', '');
        if (emailFromLink.includes('@')) {
          email = emailFromLink;
        }
      }
      
      // 5. 📧 SE NÃO ENCONTROU EMAIL, BUSCAR NO TEXTO
      if (!email && emailMatches && emailMatches.length > 0) {
        email = emailMatches[0];
      }
      
      // 6. 📦 CONTAR PRODUTOS
      const productElements = doc.querySelectorAll('[class*="product"], [class*="item"], .card, .produto');
      const totalProducts = productElements.length || 50; // Fallback
      
      // Gerar descrição baseada no nome
      const description = `Fornecedor ${name} especializado em moda e vestuário no atacado e varejo`;
      
      console.log(`📊 Dados extraídos:`, {
        name,
        phone,
        whatsapp,
        email,
        totalProducts
      });
      
      if (name) {
        return {
          name,
          description,
          phone,
          whatsapp,
          email,
          totalProducts
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro no parsing da página:', error);
      return null;
    }
  }

  // Extrair dados do catálogo Vendizap
  static async extractVendizapCatalog(vendizapUrl: string): Promise<{
    products: any[];
    supplierInfo: any;
  }> {
    try {
      // Simular extração de dados do Vendizap
      // Em produção, isso seria feito via web scraping ou API
      console.log('🔍 Extraindo dados de:', vendizapUrl);
      
      // Mock data baseado no padrão Vendizap
      const mockProducts = [
        {
          id: 'vz_001',
          name: 'Camiseta Básica Masculina',
          price: 25.90,
          originalPrice: 35.90,
          imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600',
          category: 'Masculino',
          description: 'Camiseta básica 100% algodão',
          sku: 'CAM001',
          sizes: ['P', 'M', 'G', 'GG'],
          colors: ['Branco', 'Preto', 'Azul'],
          availability: 'in_stock'
        },
        {
          id: 'vz_002',
          name: 'Vestido Floral Feminino',
          price: 89.90,
          originalPrice: 120.00,
          imageUrl: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600',
          category: 'Feminino',
          description: 'Vestido floral manga curta',
          sku: 'VES001',
          sizes: ['P', 'M', 'G'],
          colors: ['Floral Rosa', 'Floral Azul'],
          availability: 'in_stock'
        },
        {
          id: 'vz_003',
          name: 'Calça Jeans Infantil',
          price: 45.90,
          originalPrice: 65.90,
          imageUrl: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
          category: 'Infantil',
          description: 'Calça jeans infantil confortável',
          sku: 'CAL001',
          sizes: ['2', '4', '6', '8', '10'],
          colors: ['Azul Claro', 'Azul Escuro'],
          availability: 'in_stock'
        }
      ];

      const supplierInfo = {
        name: 'Vendedor Bernardos',
        phone: '(11) 99999-9999',
        whatsapp: '(11) 99999-9999',
        totalProducts: mockProducts.length
      };

      return {
        products: mockProducts,
        supplierInfo
      };
    } catch (error) {
      console.error('Erro ao extrair catálogo:', error);
      throw new Error('Falha na extração do catálogo');
    }
  }

  // Sincronizar produtos do fornecedor
  static async syncSupplierProducts(
    supplierId: string, 
    vendizapUrl: string
  ): Promise<CatalogSyncResult> {
    try {
      // Extrair dados do catálogo
      const { products, supplierInfo } = await this.extractVendizapCatalog(vendizapUrl);
      
      let newProducts = 0;
      let updatedProducts = 0;
      const errors: string[] = [];

      // Processar cada produto
      for (const product of products) {
        try {
          // Verificar se produto já existe
          const { data: existingProduct } = await supabase
            .from('supplier_products')
            .select('id')
            .eq('supplier_id', supplierId)
            .eq('supplier_product_id', product.id)
            .maybeSingle();

          const productData = {
            supplier_id: supplierId,
            supplier_product_id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice,
            image_url: product.imageUrl,
            category: product.category,
            availability: product.availability,
            sku: product.sku,
            sizes: product.sizes,
            colors: product.colors,
            vendizap_data: product,
            last_updated: new Date().toISOString()
          };

          if (existingProduct) {
            // Atualizar produto existente
            const { error } = await supabase
              .from('supplier_products')
              .update(productData)
              .eq('id', existingProduct.id);

            if (error) {
              errors.push(`Erro ao atualizar ${product.name}: ${error.message}`);
            } else {
              updatedProducts++;
            }
          } else {
            // Criar novo produto
            const { error } = await supabase
              .from('supplier_products')
              .insert([productData]);

            if (error) {
              errors.push(`Erro ao criar ${product.name}: ${error.message}`);
            } else {
              newProducts++;
            }
          }
        } catch (productError) {
          errors.push(`Erro no produto ${product.name}: ${productError}`);
        }
      }

      // Atualizar informações do fornecedor
      await supabase
        .from('suppliers')
        .update({
          last_sync: new Date().toISOString(),
          total_products: products.length
        })
        .eq('id', supplierId);

      return {
        success: errors.length === 0,
        totalProducts: products.length,
        newProducts,
        updatedProducts,
        errors,
        syncedAt: new Date(),
        supplierName: supplierInfo.name,
        supplierUrl: vendizapUrl
      };
    } catch (error) {
      return {
        success: false,
        totalProducts: 0,
        newProducts: 0,
        updatedProducts: 0,
        errors: [`Erro geral: ${error}`],
        syncedAt: new Date(),
        supplierName: 'Desconhecido',
        supplierUrl: vendizapUrl
      };
    }
  }

  // Importar produtos do fornecedor para o catálogo principal
  static async importProductsToMainCatalog(
    supplierProductIds: string[],
    markupPercentage: number = 30
  ): Promise<{ success: boolean; imported: number; errors: string[] }> {
    try {
      let imported = 0;
      const errors: string[] = [];

      for (const productId of supplierProductIds) {
        try {
          // Buscar produto do fornecedor
          const { data: supplierProduct, error: fetchError } = await supabase
            .from('supplier_products')
            .select('*')
            .eq('id', productId)
            .single();

          if (fetchError || !supplierProduct) {
            errors.push(`Produto não encontrado: ${productId}`);
            continue;
          }

          // Calcular preço com markup
          const finalPrice = supplierProduct.price * (1 + markupPercentage / 100);

          // Verificar se já existe no catálogo principal
          const { data: existingMainProduct } = await supabase
            .from('products')
            .select('id')
            .eq('name', supplierProduct.name)
            .single();

          if (existingMainProduct) {
            errors.push(`Produto já existe no catálogo: ${supplierProduct.name}`);
            continue;
          }

          // Inserir no catálogo principal
          const { error: insertError } = await supabase
            .from('products')
            .insert([{
              name: supplierProduct.name,
              price: finalPrice,
              old_price: supplierProduct.original_price ? 
                supplierProduct.original_price * (1 + markupPercentage / 100) : null,
              image_url: supplierProduct.image_url,
              category: supplierProduct.category
            }]);

          if (insertError) {
            errors.push(`Erro ao importar ${supplierProduct.name}: ${insertError.message}`);
          } else {
            imported++;
          }
        } catch (productError) {
          errors.push(`Erro no produto ${productId}: ${productError}`);
        }
      }

      return {
        success: errors.length === 0,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erro geral: ${error}`]
      };
    }
  }

  // Buscar fornecedores
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        vendizapUrl: supplier.vendizap_url,
        catalogUrl: supplier.catalog_url,
        description: supplier.description,
        contactInfo: {
          phone: supplier.phone,
          email: supplier.email,
          whatsapp: supplier.whatsapp
        },
        status: supplier.status,
        categories: supplier.categories || [],
        lastSync: supplier.last_sync ? new Date(supplier.last_sync) : undefined,
        totalProducts: supplier.total_products || 0,
        createdAt: new Date(supplier.created_at),
        updatedAt: new Date(supplier.updated_at)
      }));
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  }

  // Criar novo fornecedor
  static async createSupplier(supplierData: {
    name: string;
    vendizapUrl: string;
    description?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
  }): Promise<{ success: boolean; supplier?: Supplier; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplierData.name,
          vendizap_url: supplierData.vendizapUrl,
          catalog_url: supplierData.vendizapUrl,
          description: supplierData.description,
          phone: supplierData.contactInfo?.phone,
          email: supplierData.contactInfo?.email,
          whatsapp: supplierData.contactInfo?.whatsapp,
          status: 'active',
          categories: []
        }])
        .select()
        .single();

      if (error) throw error;

      const supplier: Supplier = {
        id: data.id,
        name: data.name,
        vendizapUrl: data.vendizap_url,
        catalogUrl: data.catalog_url,
        description: data.description,
        contactInfo: {
          phone: data.phone,
          email: data.email,
          whatsapp: data.whatsapp
        },
        status: data.status,
        categories: data.categories || [],
        totalProducts: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, supplier };
    } catch (error) {
      console.error('Erro detalhado ao criar fornecedor:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar fornecedor'
      };
    }
  }
}