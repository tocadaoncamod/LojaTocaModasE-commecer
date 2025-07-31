import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Store,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Ban
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SellerApplication, SellerData, SellerSale, SellerCommission } from '../../types/seller';

const SellerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'sellers' | 'sales' | 'commissions'>('applications');
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [sales, setSales] = useState<SellerSale[]>([]);
  const [commissions, setCommissions] = useState<SellerCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Carregar dados
  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedApplications: SellerApplication[] = (data || []).map(app => ({
        id: app.id,
        email: app.email,
        storeName: app.store_name,
        cpfCnpj: app.cpf_cnpj,
        whatsapp: app.whatsapp,
        businessDescription: app.business_description,
        experienceYears: app.experience_years || 0,
        monthlySalesEstimate: app.monthly_sales_estimate,
        status: app.status,
        reviewedBy: app.reviewed_by,
        reviewedAt: app.reviewed_at ? new Date(app.reviewed_at) : undefined,
        rejectionReason: app.rejection_reason,
        createdAt: new Date(app.created_at),
        updatedAt: new Date(app.updated_at)
      }));

      setApplications(formattedApplications);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSellers: SellerData[] = (data || []).map(seller => ({
        id: seller.id,
        userId: seller.user_id,
        storeName: seller.store_name,
        cpfCnpj: seller.cpf_cnpj,
        whatsapp: seller.whatsapp,
        status: seller.status || 'pending',
        commissionRate: parseFloat(seller.commission_rate || '10'),
        totalSales: parseFloat(seller.total_sales || '0'),
        totalCommission: parseFloat(seller.total_commission || '0'),
        approvedBy: seller.approved_by,
        approvedAt: seller.approved_at ? new Date(seller.approved_at) : undefined,
        rejectionReason: seller.rejection_reason,
        createdAt: new Date(seller.created_at),
        updatedAt: new Date(seller.updated_at)
      }));

      setSellers(formattedSellers);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    }
  };

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_sales')
        .select(`
          *,
          sellers!inner(store_name),
          products!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSales: SellerSale[] = (data || []).map(sale => ({
        id: sale.id,
        sellerId: sale.seller_id,
        orderId: sale.order_id,
        productId: sale.product_id,
        productName: sale.products.name,
        quantity: sale.quantity,
        unitPrice: parseFloat(sale.unit_price),
        totalAmount: parseFloat(sale.total_amount),
        commissionRate: parseFloat(sale.commission_rate),
        commissionAmount: parseFloat(sale.commission_amount),
        status: sale.status,
        createdAt: new Date(sale.created_at),
        updatedAt: new Date(sale.updated_at)
      }));

      setSales(formattedSales);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  };

  const loadCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_commissions')
        .select(`
          *,
          sellers!inner(store_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCommissions: SellerCommission[] = (data || []).map(commission => ({
        id: commission.id,
        sellerId: commission.seller_id,
        saleId: commission.sale_id,
        amount: parseFloat(commission.amount),
        status: commission.status,
        paymentMethod: commission.payment_method,
        paymentDate: commission.payment_date ? new Date(commission.payment_date) : undefined,
        paymentReference: commission.payment_reference,
        approvedBy: commission.approved_by,
        approvedAt: commission.approved_at ? new Date(commission.approved_at) : undefined,
        notes: commission.notes,
        createdAt: new Date(commission.created_at),
        updatedAt: new Date(commission.updated_at)
      }));

      setCommissions(formattedCommissions);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadApplications(),
        loadSellers(),
        loadSales(),
        loadCommissions()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Aprovar/Rejeitar solicitação
  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const { error } = await supabase
        .from('seller_applications')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', applicationId);

      if (error) throw error;

      await loadApplications();
      alert(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      alert('Erro ao processar solicitação');
    }
  };

  // Atualizar status do vendedor
  const handleSellerStatusUpdate = async (sellerId: string, status: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          status,
          rejection_reason: reason || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', sellerId);

      if (error) throw error;

      await loadSellers();
      alert('Status do vendedor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      alert('Erro ao atualizar vendedor');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      suspended: 'Suspenso',
      confirmed: 'Confirmado',
      paid: 'Pago',
      cancelled: 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const tabs = [
    { id: 'applications', label: 'Solicitações', icon: Clock, count: applications.filter(a => a.status === 'pending').length },
    { id: 'sellers', label: 'Vendedores', icon: Users, count: sellers.length },
    { id: 'sales', label: 'Vendas', icon: TrendingUp, count: sales.length },
    { id: 'commissions', label: 'Comissões', icon: DollarSign, count: commissions.filter(c => c.status === 'pending').length }
  ];

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Vendedores</h1>
            <p className="text-gray-600">Gerencie vendedores, aprovações e comissões</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solicitações Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendedores Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {sellers.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comissões Pendentes</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                    {activeTab === 'sellers' && <option value="suspended">Suspenso</option>}
                  </select>
                </div>
              </div>

              {/* Applications Tab */}
              {activeTab === 'applications' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Solicitante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loja
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
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
                      {applications
                        .filter(app => 
                          (statusFilter === 'all' || app.status === statusFilter) &&
                          (app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{application.email}</div>
                              <div className="text-sm text-gray-500">{application.whatsapp}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{application.storeName}</div>
                            <div className="text-sm text-gray-500">{application.cpfCnpj}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(application.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(application);
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {application.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApplicationAction(application.id, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Aprovar"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Motivo da rejeição (opcional):');
                                      handleApplicationAction(application.id, 'reject', reason || undefined);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Rejeitar"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sellers Tab */}
              {activeTab === 'sellers' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comissão
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
                      {sellers
                        .filter(seller => 
                          (statusFilter === 'all' || seller.status === statusFilter) &&
                          seller.storeName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((seller) => (
                        <tr key={seller.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{seller.storeName}</div>
                              <div className="text-sm text-gray-500">{seller.whatsapp}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(seller.totalSales)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(seller.totalCommission)}</div>
                            <div className="text-sm text-gray-500">{seller.commissionRate}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(seller.status)}`}>
                              {getStatusText(seller.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(seller);
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {seller.status !== 'suspended' && (
                                <button
                                  onClick={() => handleSellerStatusUpdate(seller.id, 'suspended', 'Suspenso pelo administrador')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Suspender"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sales Tab */}
              {activeTab === 'sales' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comissão
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sale.productName}</div>
                            <div className="text-sm text-gray-500">Qtd: {sale.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Vendedor #{sale.sellerId.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(sale.totalAmount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">{formatPrice(sale.commissionAmount)}</div>
                            <div className="text-sm text-gray-500">{sale.commissionRate}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(sale.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Commissions Tab */}
              {activeTab === 'commissions' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissions
                        .filter(commission => 
                          statusFilter === 'all' || commission.status === statusFilter
                        )
                        .map((commission) => (
                        <tr key={commission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Vendedor #{commission.sellerId.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(commission.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                              {getStatusText(commission.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(commission.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {commission.status === 'pending' && (
                              <button
                                onClick={() => {
                                  // Implementar aprovação de comissão
                                  console.log('Aprovar comissão:', commission.id);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Aprovar pagamento"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal para detalhes */}
      {showModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManagement;