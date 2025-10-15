import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, Package } from 'lucide-react';
import { Product, useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';
import AdvancedProductForm from './AdvancedProductForm';

const ProductManagement: React.FC = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleAddProduct = async (formData: any, uploadedImages: string[]) => {
    try {
      const productData = {
        name: formData.name,
        price: formData.price,
        old_price: formData.old_price || null,
        image_url: formData.image_url,
        category: formData.category,
        subcategory: formData.subcategory || null,
        brand: formData.brand || null,
        sku: formData.sku || null,
        description: formData.description || null,
        material: formData.material || null,
        care_instructions: formData.care_instructions || null,
        weight: formData.weight || 0,
        dimensions: formData.dimensions || { length: 0, width: 0, height: 0 },
        shipping_time_days: formData.shipping_time_days || 7,
        warranty_days: formData.warranty_days || 30,
        tags: formData.tags || [],
        keywords: formData.keywords || null,
        featured_category: formData.featured_category || null,
        video_url: formData.video_url || null,
        origin_location: formData.origin_location || 'São Paulo, SP',
        discount_type: formData.discount_type || null,
        discount_value: formData.discount_value || 0,
        measurements: formData.measurements || {},
        stock: 0,
        is_active: true
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;

      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      if (formData.sizes && formData.sizes.length > 0) {
        const sizeRecords = formData.sizes.map((size: any) => ({
          product_id: product.id,
          size_name: size.size_name,
          stock_quantity: size.stock_quantity,
          additional_price: size.additional_price,
          is_available: size.is_available
        }));

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizeRecords);

        if (sizesError) throw sizesError;
      }

      if (formData.colors && formData.colors.length > 0) {
        const colorRecords = formData.colors.map((color: any) => ({
          product_id: product.id,
          color_name: color.color_name,
          color_hex: color.color_hex,
          image_url: color.image_url,
          stock_quantity: color.stock_quantity,
          is_available: color.is_available
        }));

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorRecords);

        if (colorsError) throw colorsError;
      }

      alert('Produto criado com sucesso!');
      setShowAddModal(false);
      refreshProducts();
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      alert('Erro ao criar produto: ' + (err as Error).message);
    }
  };

  const handleEditProduct = async (formData: any, uploadedImages: string[]) => {
    if (!editingProduct) return;

    try {
      const productData = {
        name: formData.name,
        price: formData.price,
        old_price: formData.old_price || null,
        image_url: formData.image_url,
        category: formData.category,
        subcategory: formData.subcategory || null,
        brand: formData.brand || null,
        sku: formData.sku || null,
        description: formData.description || null,
        material: formData.material || null,
        care_instructions: formData.care_instructions || null,
        weight: formData.weight || 0,
        dimensions: formData.dimensions || { length: 0, width: 0, height: 0 },
        shipping_time_days: formData.shipping_time_days || 7,
        warranty_days: formData.warranty_days || 30,
        tags: formData.tags || [],
        keywords: formData.keywords || null,
        featured_category: formData.featured_category || null,
        video_url: formData.video_url || null,
        origin_location: formData.origin_location || 'São Paulo, SP',
        discount_type: formData.discount_type || null,
        discount_value: formData.discount_value || 0,
        measurements: formData.measurements || {}
      };

      const { error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (productError) throw productError;

      if (uploadedImages.length > 0) {
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', editingProduct.id);

        const imageRecords = uploadedImages.map((url, index) => ({
          product_id: editingProduct.id,
          image_url: url,
          display_order: index
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      await supabase.from('product_sizes').delete().eq('product_id', editingProduct.id);
      if (formData.sizes && formData.sizes.length > 0) {
        const sizeRecords = formData.sizes.map((size: any) => ({
          product_id: editingProduct.id,
          size_name: size.size_name,
          stock_quantity: size.stock_quantity,
          additional_price: size.additional_price,
          is_available: size.is_available
        }));

        await supabase.from('product_sizes').insert(sizeRecords);
      }

      await supabase.from('product_colors').delete().eq('product_id', editingProduct.id);
      if (formData.colors && formData.colors.length > 0) {
        const colorRecords = formData.colors.map((color: any) => ({
          product_id: editingProduct.id,
          color_name: color.color_name,
          color_hex: color.color_hex,
          image_url: color.image_url,
          stock_quantity: color.stock_quantity,
          is_available: color.is_available
        }));

        await supabase.from('product_colors').insert(colorRecords);
      }

      alert('Produto atualizado com sucesso!');
      setEditingProduct(null);
      refreshProducts();
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      alert('Erro ao atualizar produto: ' + (err as Error).message);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Produto excluído com sucesso!');
      refreshProducts();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto: ' + (err as Error).message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Gerenciamento de Produtos
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} cadastrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
        >
          <Plus className="h-5 w-5" />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todas as Categorias</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Erro ao carregar produtos: {error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</div>
                      {product.oldPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock || 0} un.
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AdvancedProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingProduct && (
        <AdvancedProductForm
          initialData={{
            name: editingProduct.name,
            price: editingProduct.price,
            old_price: editingProduct.oldPrice,
            image_url: editingProduct.imageUrl,
            category: editingProduct.category,
            description: editingProduct.description || '',
            ...editingProduct
          }}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default ProductManagement;
