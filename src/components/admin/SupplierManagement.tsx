import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, FolderSync as Sync, Download, ExternalLink, Package, AlertCircle, CheckCircle, Clock, X, Save, Trash2 } from 'lucide-react';
import { Supplier, SupplierProduct, CatalogSyncResult } from '../../types/supplier';
import { SupplierService } from '../../services/supplierService';
import { supabase } from '../../lib/supabase';

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [syncingSupplier, setSyncingSupplier] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<CatalogSyncResult | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [markupPercentage, setMarkupPercentage] = useState(30);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingProducts, setImportingProducts] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);

  // Bulk add states
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkResults, setBulkResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    vendizapUrl: '',
    description: '',
    phone: '',
    email: '',
    whatsapp: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await SupplierService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierProducts = async (supplierId: string) => {
    try {
      // Implementar busca de produtos do fornecedor
      // Por enquanto, usar dados mock
      setSupplierProducts([]);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome do fornecedor é obrigatório';
    }
    
    if (!formData.vendizapUrl.trim()) {
      errors.vendizapUrl = 'URL do Vendizap é obrigatória';
    } else if (!formData.vendizapUrl.includes('vendizap.com')) {
      errors.vendizapUrl = 'URL deve ser do Vendizap';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, vendizapUrl: url }));
    
    // Auto-extrair informações se a URL for válida do Vendizap
    if (url.includes('vendizap.com') && (url.includes('https://') || url.includes('http://'))) {
      setIsExtracting(true);
      setAutoFillEnabled(true);
      
      try {
        const supplierInfo = await SupplierService.extractSupplierInfo(url);
        
        // Preencher automaticamente os campos
        setFormData(prev => ({
          ...prev,
          name: supplierInfo.name,
          description: supplierInfo.description,
          phone: supplierInfo.phone || '',
          whatsapp: supplierInfo.whatsapp || '',
          email: supplierInfo.email || ''
        }));
        
        // Limpar erros
        setFormErrors({});
        
        // Mostrar feedback de sucesso
        console.log('✅ Dados extraídos:', {
          nome: supplierInfo.name,
          descrição: supplierInfo.description,
          telefone: supplierInfo.phone,
          whatsapp: `WhatsApp: ${supplierInfo.whatsapp}`,
          email: supplierInfo.email,
          totalProdutos: supplierInfo.totalProducts
        });
        
      } catch (error) {
        console.error('Erro na extração automática:', error);
        setFormErrors({ vendizapUrl: 'Erro ao extrair informações do fornecedor' });
      } finally {
        setIsExtracting(false);
      }
    } else {
      setAutoFillEnabled(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await SupplierService.createSupplier({
        name: formData.name,
        vendizapUrl: formData.vendizapUrl,
        description: formData.description,
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp
        }
      });

      if (result.success) {
        alert('Fornecedor criado com sucesso!');
        setShowAddModal(false);
        resetForm();
        loadSuppliers();
        
        // Auto-sincronizar após criar
        if (result.supplier) {
          setTimeout(() => {
            handleSync(result.supplier!);
          }, 1000);
        }
      } else {
        console.error('Erro no resultado:', result.error);
        alert(result.error || 'Erro ao criar fornecedor');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vendizapUrl: '',
      description: '',
      phone: '',
      email: '',
      whatsapp: ''
    });
    setFormErrors({});
    setAutoFillEnabled(false);
    setIsExtracting(false);
  };

  const handleSync = async (supplier: Supplier) => {
    setSyncingSupplier(supplier.id);
    setSyncResults(null);
    
    try {
      const result = await SupplierService.syncSupplierProducts(
        supplier.id, 
        supplier.vendizapUrl
      );
      
      setSyncResults(result);
      loadSuppliers(); // Recarregar para atualizar contadores
      
      if (result.success) {
        alert(`Sincronização concluída!\n${result.newProducts} novos produtos\n${result.updatedProducts} produtos atualizados`);
      } else {
        alert(`Sincronização com erros:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      alert('Erro na sincronização: ' + error);
    } finally {
      setSyncingSupplier(null);
    }
  };

  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    loadSupplierProducts(supplier.id);
    setShowProductsModal(true);
  };

  const handleExtractAndImport = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowImportModal(true);
    setImportResults(null);
  };

  const handleImportAllProducts = async () => {
    if (!selectedSupplier) return;
    
    setImportingProducts(true);
    setImportResults(null);
    
    try {
      // 1. Primeiro sincronizar produtos do fornecedor
      console.log('🔄 Sincronizando produtos do fornecedor...');
      const syncResult = await SupplierService.syncSupplierProducts(
        selectedSupplier.id,
        selectedSupplier.vendizapUrl
      );
      
      if (!syncResult.success) {
        throw new Error(`Erro na sincronização: ${syncResult.errors.join(', ')}`);
      }
      
      // 2. Buscar todos os produtos sincronizados
      const { data: supplierProducts, error: fetchError } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('supplier_id', selectedSupplier.id);
      
      if (fetchError) {
        throw new Error(`Erro ao buscar produtos: ${fetchError.message}`);
      }
      
      if (!supplierProducts || supplierProducts.length === 0) {
        throw new Error('Nenhum produto encontrado para importar');
      }
      
      // 3. Importar todos os produtos para o catálogo principal
      console.log(`📦 Importando ${supplierProducts.length} produtos...`);
      
      let imported = 0;
      const errors: string[] = [];
      
      for (const supplierProduct of supplierProducts) {
        try {
          // Calcular preço com markup
          const finalPrice = supplierProduct.price * (1 + markupPercentage / 100);
          const oldPrice = supplierProduct.original_price ? 
            supplierProduct.original_price * (1 + markupPercentage / 100) : null;
          
          // Verificar se já existe no catálogo principal
          const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('name', supplierProduct.name)
            .single();
          
          if (existingProduct) {
            console.log(`⚠️ Produto já existe: ${supplierProduct.name}`);
            continue; // Pular produtos que já existem
          }
          
          // Inserir no catálogo principal
          const { error: insertError } = await supabase
            .from('products')
            .insert([{
              name: supplierProduct.name,
              price: finalPrice,
              old_price: oldPrice,
              image_url: supplierProduct.image_url,
              category: supplierProduct.category
            }]);
          
          if (insertError) {
            errors.push(`${supplierProduct.name}: ${insertError.message}`);
          } else {
            imported++;
            console.log(`✅ Importado: ${supplierProduct.name}`);
          }
        } catch (productError) {
          errors.push(`${supplierProduct.name}: ${productError}`);
        }
      }
      
      // 4. Mostrar resultados
      setImportResults({
        success: imported,
        errors,
        total: supplierProducts.length
      });
      
      if (imported > 0) {
        alert(`✅ Importação concluída!\n${imported} produtos importados com sucesso!`);
      }
      
    } catch (error) {
      console.error('Erro na importação:', error);
      setImportResults({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        total: 0
      });
      alert(`❌ Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setImportingProducts(false);
    }
  };

  const handleImportProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto para importar');
      return;
    }

    try {
      const result = await SupplierService.importProductsToMainCatalog(
        selectedProducts,
        markupPercentage
      );

      if (result.success) {
        alert(`${result.imported} produtos importados com sucesso!`);
        setSelectedProducts([]);
        setShowProductsModal(false);
      } else {
        alert(`Importação com erros:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      alert('Erro na importação: ' + error);
    }
  };

  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${supplierName}"?\n\nEsta ação também excluirá todos os produtos associados e não pode ser desfeita.`)) {
      try {
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', supplierId);

        if (error) {
          console.error('Erro ao excluir fornecedor:', error);
          alert('Erro ao excluir fornecedor: ' + error.message);
          return;
        }

        alert('Fornecedor excluído com sucesso!');
        loadSuppliers(); // Recarregar lista
      } catch (error) {
        console.error('Erro inesperado ao excluir fornecedor:', error);
        alert('Erro inesperado ao excluir fornecedor');
      }
    }
  };
  const handleBulkAdd = async () => {
    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.includes('vendizap.com'));

    if (urls.length === 0) {
      alert('Nenhuma URL válida encontrada');
      return;
    }

    setIsBulkProcessing(true);
    setBulkResults(null);

    const results = {
      success: 0,
      errors: [] as string[],
      total: urls.length
    };

    for (const url of urls) {
      try {
        // Extrair informações do fornecedor
        const supplierInfo = await SupplierService.extractSupplierInfo(url);
        
        // Criar fornecedor
        const result = await SupplierService.createSupplier({
          name: supplierInfo.name,
          vendizapUrl: url,
          description: supplierInfo.description,
          contactInfo: {
            phone: supplierInfo.phone || '',
            email: supplierInfo.email || '',
            whatsapp: supplierInfo.whatsapp || ''
          }
        });

        if (result.success) {
          results.success++;
          
          // Auto-sincronizar após criar
          if (result.supplier) {
            try {
              await SupplierService.syncSupplierProducts(
                result.supplier.id, 
                result.supplier.vendizapUrl
              );
            } catch (syncError) {
              console.warn('Erro na sincronização automática:', syncError);
            }
          }
        } else {
          results.errors.push(`${url}: ${result.error}`);
        }
      } catch (error) {
        results.errors.push(`${url}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    setBulkResults(results);
    setIsBulkProcessing(false);
    loadSuppliers(); // Recarregar lista
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h1>
              <p className="text-gray-600">Gerencie catálogos e sincronize produtos</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Fornecedor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fornecedores</p>
              <p className="text-2xl font-bold text-purple-600">{suppliers.length}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fornecedores Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produtos</p>
              <p className="text-2xl font-bold text-blue-600">
                {suppliers.reduce((sum, s) => sum + (s.totalProducts || 0), 0)}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Sincronização</p>
              <p className="text-2xl font-bold text-orange-600">
                {suppliers.filter(s => s.lastSync).length}
              </p>
            </div>
            <Sync className="h-8 w-8 text-orange-600" />
          </div>
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
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Fornecedores ({filteredSuppliers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando fornecedores...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum fornecedor encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                Adicione seu primeiro fornecedor para começar a sincronizar produtos.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Adicionar Fornecedor
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Sync
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500">{supplier.description}</div>
                        <a
                          href={supplier.vendizapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver Catálogo
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.totalProducts || 0}
                      </div>
                      <div className="text-sm text-gray-500">produtos</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(supplier.lastSync)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                        {getStatusText(supplier.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSync(supplier)}
                          disabled={syncingSupplier === supplier.id}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                          title="Sincronizar catálogo"
                        >
                          <Sync className={`h-4 w-4 ${syncingSupplier === supplier.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleViewProducts(supplier)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Ver produtos"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExtractAndImport(supplier)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Extrair e importar produtos"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <a
                          href={supplier.vendizapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Abrir catálogo"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir fornecedor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Novo Fornecedor
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Fornecedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Vendedor Bernardos"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Vendizap *
                </label>
                <div className="relative">
                <input
                  type="url"
                  value={formData.vendizapUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.vendizapUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://vendedorbernardos.vendizap.com/"
                />
                {isExtracting && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  </div>
                )}
                </div>
                {autoFillEnabled && !isExtracting && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Informações extraídas automaticamente
                  </p>
                )}
                {formErrors.vendizapUrl && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.vendizapUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição {autoFillEnabled && <span className="text-green-600 text-xs">(Auto-preenchido)</span>}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    autoFillEnabled ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Descrição do fornecedor..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone {autoFillEnabled && <span className="text-green-600 text-xs">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFillEnabled ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp {autoFillEnabled && <span className="text-green-600 text-xs">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFillEnabled ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="5511999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email {autoFillEnabled && <span className="text-green-600 text-xs">(Auto-preenchido)</span>}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFillEnabled ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="fornecedor@email.com"
                  />
                </div>
              </div>

              {autoFillEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium mb-1">
                    ✅ Dados Extraídos do Vendizap
                  </p>
                  <p className="text-green-700 text-xs">
                    Nome, telefone, WhatsApp e email foram extraídos automaticamente da página.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isExtracting || isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isExtracting || isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isExtracting ? 'Extraindo Dados...' : 'Criando Fornecedor...'}
                    </>
                  ) : (
                    <>
                  <Save className="h-4 w-4" />
                  Criar Fornecedor
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isExtracting || isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBulkAddModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Adicionar Múltiplos Fornecedores
                </h3>
                <button
                  onClick={() => setShowBulkAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Como usar:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cole uma URL do Vendizap por linha</li>
                  <li>• Dados serão extraídos automaticamente</li>
                  <li>• Sincronização automática após criação</li>
                  <li>• Exemplo: https://vendedorbernardos.vendizap.com/</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URLs dos Fornecedores (uma por linha)
                </label>
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={8}
                  placeholder={`https://vendedorbernardos.vendizap.com/
https://modafashion.vendizap.com/
https://roupasecia.vendizap.com/
https://outrofornecedor.vendizap.com/`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkUrls.split('\n').filter(url => url.trim() && url.includes('vendizap.com')).length} URLs válidas detectadas
                </p>
              </div>

              {/* Results */}
              {bulkResults && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">📊 Resultados:</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{bulkResults.success}</p>
                      <p className="text-sm text-gray-600">Criados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{bulkResults.errors.length}</p>
                      <p className="text-sm text-gray-600">Erros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{bulkResults.total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                  
                  {bulkResults.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                      <h5 className="font-semibold text-red-900 mb-2">Erros:</h5>
                      <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                        {bulkResults.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBulkAdd}
                  disabled={isBulkProcessing || !bulkUrls.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isBulkProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando Fornecedores...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Adicionar Todos
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAddModal(false);
                    setBulkUrls('');
                    setBulkResults(null);
                  }}
                  disabled={isBulkProcessing}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  {bulkResults ? 'Fechar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Products Modal */}
      {showImportModal && selectedSupplier && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImportModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Extrair e Importar Produtos
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Supplier Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📦 Fornecedor Selecionado:</h4>
                <p className="text-blue-800 font-medium">{selectedSupplier.name}</p>
                <p className="text-blue-700 text-sm">{selectedSupplier.description}</p>
                <a
                  href={selectedSupplier.vendizapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver Catálogo Original
                </a>
              </div>

              {/* Markup Configuration */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">💰 Configuração de Preços:</h4>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-green-800">
                    Markup (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-green-700 text-sm">
                    (Preço final = Preço fornecedor + {markupPercentage}%)
                  </span>
                </div>
                <p className="text-green-700 text-xs mt-2">
                  Exemplo: Produto R$ 50,00 → Preço final R$ {(50 * (1 + markupPercentage / 100)).toFixed(2)}
                </p>
              </div>

              {/* Process Info */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⚙️ Processo de Importação:</h4>
                <ol className="text-sm text-yellow-800 space-y-1">
                  <li>1. 🔄 Sincronizar produtos do fornecedor</li>
                  <li>2. 📦 Extrair todos os produtos disponíveis</li>
                  <li>3. 💰 Aplicar markup de {markupPercentage}% nos preços</li>
                  <li>4. 📋 Importar para o catálogo principal</li>
                  <li>5. 🏷️ Categorizar automaticamente</li>
                </ol>
              </div>

              {/* Import Results */}
              {importResults && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">📊 Resultados da Importação:</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                      <p className="text-sm text-gray-600">Importados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
                      <p className="text-sm text-gray-600">Erros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{importResults.total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                  
                  {importResults.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                      <h5 className="font-semibold text-red-900 mb-2">❌ Erros:</h5>
                      <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
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
                  onClick={handleImportAllProducts}
                  disabled={importingProducts}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {importingProducts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Extraindo e Importando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Extrair e Importar Todos os Produtos
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResults(null);
                  }}
                  disabled={importingProducts}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  {importResults ? 'Fechar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Results */}
      {syncResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            {syncResults.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              Resultado da Sincronização
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-800">{syncResults.totalProducts}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Novos Produtos</p>
              <p className="text-2xl font-bold text-green-800">{syncResults.newProducts}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Atualizados</p>
              <p className="text-2xl font-bold text-purple-800">{syncResults.updatedProducts}</p>
            </div>
          </div>

          {syncResults.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Erros:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {syncResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;