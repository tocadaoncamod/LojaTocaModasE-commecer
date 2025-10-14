import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Package,
  X,
  Save,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Product, useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../ImageUpload';

const ProductManagement: React.FC = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    oldPrice: undefined,
    imageUrl: '',
    category: 'Feminino'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvResults, setCsvResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Function to save image URLs to product_images table
  const saveProductImages = async (productId: number, imageUrls: string[]) => {
    const imageRecords = imageUrls.map((url, index) => ({
      product_id: productId,
      image_url: url,
      display_order: index,
      is_primary: index === 0, // First image is primary
      alt_text: formData.name || 'Product image'
    }));

    const { error } = await supabase
      .from('product_images')
      .insert(imageRecords);

    if (error) {
      console.error('Error saving product images:', error);
      throw error;
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setUploadedImageUrls(prev => [...prev, ...urls]);
    // Use first uploaded image as main image if none set
    if (!formData.imageUrl && urls.length > 0) {
      handleInputChange('imageUrl', urls[0]);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvData.trim()) {
      alert('Por favor, cole os dados CSV ou carregue um arquivo');
      return;
    }

    setUploadingCsv(true);
    setCsvResults(null);

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validar headers obrigatórios
      const requiredHeaders = ['name', 'price', 'category', 'image_url'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        alert(`Headers obrigatórios faltando: ${missingHeaders.join(', ')}\n\nHeaders necessários: name, price, category, image_url\nHeaders opcionais: old_price, description`);
        return;
      }

      const results = {
        success: 0,
        errors: [] as string[],
        total: lines.length - 1
      };

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < headers.length) {
          results.errors.push(`Linha ${i + 1}: Dados insuficientes`);
          continue;
        }

        try {
          const productData: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index];
            
            switch (header) {
              case 'name':
                productData.name = value;
                break;
              case 'price':
                productData.price = parseFloat(value);
                break;
              case 'old_price':
                productData.old_price = value ? parseFloat(value) : null;
                break;
              case 'image_url':
                productData.image_url = value;
                break;
              case 'category':
                productData.category = value;
                break;
            }
          });

          // Validar dados
          if (!productData.name || !productData.price || !productData.image_url || !productData.category) {
            results.errors.push(`Linha ${i + 1}: Dados obrigatórios faltando`);
            continue;
          }

          // Inserir produto
          const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();

          if (insertError) {
            results.errors.push(`Linha ${i + 1} (${productData.name}): ${insertError.message}`);
            continue;
          }

          // Adicionar imagem principal à tabela product_images
          if (newProduct) {
            const { error: imageError } = await supabase
              .from('product_images')
              .insert([{
                product_id: newProduct.id,
                image_url: productData.image_url,
                alt_text: productData.name,
                display_order: 0,
                is_primary: true
              }]);

            if (imageError) {
              console.warn(`Erro ao salvar imagem do produto ${productData.name}:`, imageError);
            }
          }

          results.success++;
        } catch (error) {
          results.errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      setCsvResults(results);
      
      if (results.success > 0) {
        refreshProducts();
        alert(`✅ Upload concluído!\n${results.success} produtos criados com sucesso!`);
      }

    } catch (error) {
      alert(`Erro no processamento CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Feminino', 'Masculino', 'Infantil'];

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const { data, error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error deleting product:', error);
          alert('Erro ao excluir produto: ' + error.message);
          return;
        }

        console.log('Product deleted successfully:', data);
        refreshProducts();
        alert('Produto excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Erro inesperado ao excluir produto: ' + (error as Error).message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      oldPrice: undefined,
      imageUrl: '',
      category: 'Feminino'
    });
    setFormErrors({});
    setUploadedImageUrls([]);
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      imageUrl: product.imageUrl,
      category: product.category
    });
    setEditingProduct(product);
    setShowAddModal(true);
    setFormErrors({});
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Nome do produto é obrigatório';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Preço deve ser maior que zero';
    }
    
    if (formData.oldPrice && formData.oldPrice <= formData.price!) {
      errors.oldPrice = 'Preço antigo deve ser maior que o preço atual';
    }
    
    if (!editingProduct && uploadedImageUrls.length === 0 && !formData.imageUrl?.trim()) {
      errors.imageUrl = 'Pelo menos uma imagem é obrigatória';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Categoria é obrigatória';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const isSubmitting = true;
    
    try {
      if (editingProduct) {
        // Editar produto existente
        const { data, error } = await supabase
          .from('products')
          .update({
            name: formData.name!,
            price: formData.price!,
            old_price: formData.oldPrice || null,
            image_url: formData.imageUrl!,
            category: formData.category!
          })
          .eq('id', editingProduct.id)
          .select();

        if (error) {
          console.error('Error updating product:', error);
          alert('Erro ao atualizar produto: ' + error.message);
          return;
        }
        
        // Handle uploaded images for existing product
        if (uploadedImageUrls.length > 0) {
          try {
            await saveProductImages(editingProduct.id, uploadedImageUrls);
          } catch (imageError) {
            console.error('Error uploading images:', imageError);
            alert('Produto atualizado, mas houve erro ao fazer upload das imagens.');
          }
        }
        
        console.log('Product updated successfully:', data);
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: formData.name!,
            price: formData.price!,
            old_price: formData.oldPrice || null,
            image_url: formData.imageUrl!,
            category: formData.category!
          }])
          .select();

        if (error) {
          console.error('Error creating product:', error);
          alert('Erro ao criar produto: ' + error.message);
          return;
        }
        
        // Handle uploaded images for new product
        if (data && data[0] && uploadedImageUrls.length > 0) {
          try {
            const productId = data[0].id;
            await saveProductImages(productId, uploadedImageUrls);
          } catch (imageError) {
            console.error('Error uploading images:', imageError);
            alert('Produto criado, mas houve erro ao fazer upload das imagens.');
          }
        }
        
        console.log('Product created successfully:', data);
      }
      
      refreshProducts();
      closeModal();
      alert(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro inesperado ao salvar produto: ' + (error as Error).message);
    } finally {
      // Reset submitting state
    }
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
              <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Produto
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Produtos ({filteredProducts.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400') {
                      target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }
                  }}
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou adicione um novo produto.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o nome do produto"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Atual *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Antigo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.oldPrice || ''}
                    onChange={(e) => handleInputChange('oldPrice', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.oldPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.oldPrice && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.oldPrice}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Infantil">Infantil</option>
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagens do Produto *
                </label>
                
                {/* Supabase Storage Upload */}
                <ImageUpload
                  onUpload={handleImageUpload}
                  maxFiles={5}
                  maxSizePerFile={5}
                  bucket="products"
                  folder=""
                  className="mb-3"
                />

                {/* URL Input (fallback) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ou insira URL da imagem:
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                {formErrors.imageUrl && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.imageUrl}</p>
                )}
                {formData.imageUrl && uploadedImageUrls.length === 0 && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCsvModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload de Produtos via CSV
                </h3>
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Formato do CSV:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Headers obrigatórios:</strong> name, price, category, image_url</p>
                  <p><strong>Headers opcionais:</strong> old_price, description</p>
                  <p><strong>Categorias válidas:</strong> Feminino, Masculino, Infantil</p>
                  <p><strong>Formato de preço:</strong> Use ponto para decimal (ex: 29.90)</p>
                </div>
              </div>

              {/* Example */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📝 Exemplo de CSV:</h4>
                <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`name,price,old_price,category,image_url
"Camiseta Básica",29.90,39.90,Masculino,"https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg"
"Vestido Floral",89.90,,Feminino,"https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg"
"Calça Jeans Infantil",45.90,65.90,Infantil,"https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"`}
                </pre>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carregar Arquivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv,.tsv"
                  onChange={handleCsvFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Arquivo carregado: {csvFile.name}
                  </p>
                )}
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ou Cole os Dados CSV Aqui
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={8}
                  placeholder="Cole seus dados CSV aqui..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {csvData ? `${csvData.split('\n').length - 1} produtos detectados` : 'Nenhum dado inserido'}
                </p>
              </div>

              {/* Results */}
              {csvResults && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">📊 Resultados do Upload:</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{csvResults.success}</p>
                      <p className="text-sm text-gray-600">Criados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{csvResults.errors.length}</p>
                      <p className="text-sm text-gray-600">Erros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{csvResults.total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                  
                  {csvResults.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                      <h5 className="font-semibold text-red-900 mb-2">❌ Erros:</h5>
                      <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                        {csvResults.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCsvUpload}
                  disabled={uploadingCsv || !csvData.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {uploadingCsv ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando CSV...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Fazer Upload dos Produtos
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvData('');
                    setCsvFile(null);
                    setCsvResults(null);
                  }}
                  disabled={uploadingCsv}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  {csvResults ? 'Fechar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;