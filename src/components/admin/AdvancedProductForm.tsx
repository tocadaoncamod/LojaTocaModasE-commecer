import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Video, Tag, Package, Ruler, Palette } from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface ProductSize {
  size_name: string;
  stock_quantity: number;
  additional_price: number;
  is_available: boolean;
}

interface ProductColor {
  color_name: string;
  color_hex: string;
  image_url: string;
  stock_quantity: number;
  is_available: boolean;
}

interface AdvancedProductFormData {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  price: number;
  old_price?: number;
  image_url: string;
  description: string;
  material: string;
  care_instructions: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shipping_time_days: number;
  warranty_days: number;
  tags: string[];
  keywords: string;
  featured_category: string;
  video_url: string;
  origin_location: string;
  discount_type: string;
  discount_value: number;
  measurements: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
  };
  sizes: ProductSize[];
  colors: ProductColor[];
}

interface AdvancedProductFormProps {
  initialData?: Partial<AdvancedProductFormData>;
  onSubmit: (data: AdvancedProductFormData, images: string[]) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const AdvancedProductForm: React.FC<AdvancedProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<AdvancedProductFormData>({
    name: '',
    category: 'Feminino',
    subcategory: '',
    brand: '',
    sku: '',
    price: 0,
    old_price: undefined,
    image_url: '',
    description: '',
    material: '',
    care_instructions: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    shipping_time_days: 7,
    warranty_days: 30,
    tags: [],
    keywords: '',
    featured_category: '',
    video_url: '',
    origin_location: 'São Paulo, SP',
    discount_type: '',
    discount_value: 0,
    measurements: {},
    sizes: [],
    colors: [],
    ...initialData
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'basic' | 'details' | 'variations' | 'seo'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof AdvancedProductFormData] as any, [field]: value }
    }));
  };

  const handleImageUpload = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
    if (!formData.image_url && urls.length > 0) {
      handleChange('image_url', urls[0]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  const addSize = () => {
    handleChange('sizes', [...formData.sizes, {
      size_name: '',
      stock_quantity: 0,
      additional_price: 0,
      is_available: true
    }]);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    handleChange('sizes', newSizes);
  };

  const removeSize = (index: number) => {
    handleChange('sizes', formData.sizes.filter((_, i) => i !== index));
  };

  const addColor = () => {
    handleChange('colors', [...formData.colors, {
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      stock_quantity: 0,
      is_available: true
    }]);
  };

  const updateColor = (index: number, field: keyof ProductColor, value: any) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    handleChange('colors', newColors);
  };

  const removeColor = (index: number) => {
    handleChange('colors', formData.colors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData, uploadedImages);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Feminino', 'Masculino', 'Infantil', 'Unissex'];
  const subcategories = {
    Feminino: ['Biquíni', 'Maiô', 'Vestido', 'Blusa', 'Calça', 'Shorts', 'Saia', 'Conjunto'],
    Masculino: ['Camisa', 'Camiseta', 'Calça', 'Bermuda', 'Sunga', 'Conjunto'],
    Infantil: ['Vestido', 'Conjunto', 'Camiseta', 'Shorts', 'Calça'],
    Unissex: ['Acessórios', 'Bolsas', 'Chapéus', 'Óculos']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex overflow-x-auto px-6">
            {[
              { id: 'basic', label: 'Informações Básicas', icon: Package },
              { id: 'details', label: 'Detalhes e Logística', icon: Ruler },
              { id: 'variations', label: 'Variações', icon: Palette },
              { id: 'seo', label: 'SEO e Visibilidade', icon: Tag }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Biquíni Cortininha Floral"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Toca da Onça"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategoria
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleChange('subcategory', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {subcategories[formData.category as keyof typeof subcategories]?.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Código Único)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: BIQ-CORT-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material/Tecido
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => handleChange('material', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 82% Poliamida, 18% Elastano"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Atual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Original (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.old_price || ''}
                    onChange={(e) => handleChange('old_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Detalhada *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o produto com detalhes: estilo, ocasião de uso, características especiais..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagens do Produto * (até 5)
                </label>
                <ImageUpload onUpload={handleImageUpload} maxImages={5} />
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {uploadedImages.map((url, idx) => (
                      <img key={idx} src={url} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  URL do Vídeo (Instagram/TikTok/YouTube)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {currentTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (gramas)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprimento (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedChange('dimensions', 'length', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedChange('dimensions', 'width', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleNestedChange('dimensions', 'height', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo de Envio (dias)
                  </label>
                  <input
                    type="number"
                    value={formData.shipping_time_days}
                    onChange={(e) => handleChange('shipping_time_days', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garantia (dias)
                  </label>
                  <input
                    type="number"
                    value={formData.warranty_days}
                    onChange={(e) => handleChange('warranty_days', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local de Origem
                </label>
                <input
                  type="text"
                  value={formData.origin_location}
                  onChange={(e) => handleChange('origin_location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções de Lavagem
                </label>
                <textarea
                  rows={3}
                  value={formData.care_instructions}
                  onChange={(e) => handleChange('care_instructions', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Lavar à mão com água fria. Não usar alvejante. Secar à sombra."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Medidas do Produto (cm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Busto</label>
                    <input
                      type="text"
                      value={formData.measurements.bust || ''}
                      onChange={(e) => handleNestedChange('measurements', 'bust', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Ex: 85-90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cintura</label>
                    <input
                      type="text"
                      value={formData.measurements.waist || ''}
                      onChange={(e) => handleNestedChange('measurements', 'waist', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Ex: 70-75"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Quadril</label>
                    <input
                      type="text"
                      value={formData.measurements.hips || ''}
                      onChange={(e) => handleNestedChange('measurements', 'hips', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Ex: 92-97"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Comprimento</label>
                    <input
                      type="text"
                      value={formData.measurements.length || ''}
                      onChange={(e) => handleNestedChange('measurements', 'length', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Ex: 60"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Descontos e Promoções</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Desconto
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => handleChange('discount_type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Nenhum</option>
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                      <option value="bulk">Desconto Progressivo (ex: Leve 3, Pague 2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Desconto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => handleChange('discount_value', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'variations' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Tamanhos Disponíveis</h3>
                  <button
                    type="button"
                    onClick={addSize}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Tamanho
                  </button>
                </div>

                {formData.sizes.map((size, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Tamanho</label>
                      <input
                        type="text"
                        value={size.size_name}
                        onChange={(e) => updateSize(index, 'size_name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ex: P, M, G, 38"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Estoque</label>
                      <input
                        type="number"
                        value={size.stock_quantity}
                        onChange={(e) => updateSize(index, 'stock_quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Preço Adicional</label>
                      <input
                        type="number"
                        step="0.01"
                        value={size.additional_price}
                        onChange={(e) => updateSize(index, 'additional_price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={size.is_available}
                          onChange={(e) => updateSize(index, 'is_available', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Disponível</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cores Disponíveis</h3>
                  <button
                    type="button"
                    onClick={addColor}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Cor
                  </button>
                </div>

                {formData.colors.map((color, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Nome da Cor</label>
                      <input
                        type="text"
                        value={color.color_name}
                        onChange={(e) => updateColor(index, 'color_name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ex: Vermelho"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Código Hex</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={color.color_hex}
                          onChange={(e) => updateColor(index, 'color_hex', e.target.value)}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color.color_hex}
                          onChange={(e) => updateColor(index, 'color_hex', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">URL da Imagem</label>
                      <input
                        type="url"
                        value={color.image_url}
                        onChange={(e) => updateColor(index, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Estoque</label>
                      <input
                        type="number"
                        value={color.stock_quantity}
                        onChange={(e) => updateColor(index, 'stock_quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={color.is_available}
                          onChange={(e) => updateColor(index, 'is_available', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Disponível</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palavras-chave para SEO
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: biquíni, moda praia, verão, praia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags do Produto
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria de Destaque
                </label>
                <select
                  value={formData.featured_category}
                  onChange={(e) => handleChange('featured_category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhuma</option>
                  <option value="Mais Vendidos">Mais Vendidos</option>
                  <option value="Novidades">Novidades</option>
                  <option value="Promoção">Promoção</option>
                  <option value="Exclusivo">Exclusivo</option>
                  <option value="Tendência">Tendência</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Dicas de SEO</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use palavras-chave relevantes no nome e descrição</li>
                  <li>• Adicione tags específicas para melhor categorização</li>
                  <li>• Mantenha a descrição detalhada e informativa</li>
                  <li>• Use imagens de alta qualidade</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
            >
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedProductForm;
