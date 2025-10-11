'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Order as ApiOrder } from '@/types/dotflow';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  CreditCard,
  Star,
  User
} from 'lucide-react';

// Usar a interface Order da API
type Order = ApiOrder;

export default function OrdersPage() {
  const router = useRouter();
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');


  // Carregar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        console.log('🛒 Carregando pedidos da API...');
        const response = await dotflowAPI.getOrders();
        setOrders(response.orders || []);
        console.log('✅ Pedidos carregados:', response.orders?.length || 0);
      } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        // Em caso de erro, manter array vazio
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      loadOrders();
    }
  }, [auth.isAuthenticated]);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Obter status info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { label: 'Aguardando Pagamento', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
      confirmed: { label: 'Pagamento Confirmado', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
      preparing: { label: 'Preparando Pedido', color: 'text-orange-600', bg: 'bg-orange-100', icon: Package },
      shipped: { label: 'Enviado', color: 'text-purple-600', bg: 'bg-purple-100', icon: Truck },
      delivered: { label: 'Entregue', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
      completed: { label: 'Concluído', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Package };
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatar preço
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericPrice);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDownloadInvoice = (orderId: string) => {
    // Simular download da nota fiscal
    alert(`Download da nota fiscal do pedido ${orderId} iniciado`);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meus Pedidos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Acompanhe o status e histórico de suas compras
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por número do pedido ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="md:w-64">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Aguardando Pagamento</option>
                <option value="confirmed">Pagamento Confirmado</option>
                <option value="preparing">Preparando Pedido</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Você ainda não fez nenhum pedido'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fazer Primeira Compra
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header do Pedido */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Qtd: {item.quantity} • {formatPrice(item.unit_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Cliente</p>
                        <p className="font-medium text-gray-900">{order.customers.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{order.customers.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Nota Fiscal
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do Pedido {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Informações do Pedido */}
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Status do Pedido</h3>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedOrder.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <>
                          <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          </div>
                          <span className={`font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Itens */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Itens do Pedido</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Preço unitário: {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Informações do Cliente
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">Nome: {selectedOrder.customers.name}</p>
                    <p className="text-gray-900">Email: {selectedOrder.customers.email}</p>
                    <p className="text-gray-900">Total: {formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                </div>

                {/* Data do Pedido */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data do Pedido
                  </h3>
                  <p className="text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Nota Fiscal
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 