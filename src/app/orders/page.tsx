'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  Star
} from 'lucide-react';

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  trackingCode?: string;
  estimatedDelivery?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo dos pedidos
  const sampleOrders: Order[] = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 299.90,
      items: [
        {
          id: 1,
          productId: 1,
          name: 'Smartphone Galaxy S23',
          price: 299.90,
          quantity: 1,
          image: '/api/placeholder/80/80'
        }
      ],
      shippingAddress: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      paymentMethod: 'Cartão de Crédito',
      trackingCode: 'BR123456789BR',
      estimatedDelivery: '2024-01-20'
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 159.80,
      items: [
        {
          id: 2,
          productId: 2,
          name: 'Fone de Ouvido Bluetooth',
          price: 79.90,
          quantity: 2,
          image: '/api/placeholder/80/80'
        }
      ],
      shippingAddress: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      paymentMethod: 'PIX',
      trackingCode: 'BR987654321BR',
      estimatedDelivery: '2024-01-18'
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-05',
      status: 'preparing',
      total: 89.90,
      items: [
        {
          id: 3,
          productId: 3,
          name: 'Capa para Smartphone',
          price: 29.90,
          quantity: 3,
          image: '/api/placeholder/80/80'
        }
      ],
      shippingAddress: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      paymentMethod: 'Boleto Bancário'
    },
    {
      id: 'ORD-2024-004',
      date: '2024-01-01',
      status: 'cancelled',
      total: 199.90,
      items: [
        {
          id: 4,
          productId: 4,
          name: 'Smart Watch',
          price: 199.90,
          quantity: 1,
          image: '/api/placeholder/80/80'
        }
      ],
      shippingAddress: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      paymentMethod: 'Cartão de Crédito'
    }
  ];

  // Carregar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Simular carregamento da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(sampleOrders);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
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
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Obter status info
  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      pending: { label: 'Aguardando Pagamento', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
      confirmed: { label: 'Pagamento Confirmado', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
      preparing: { label: 'Preparando Pedido', color: 'text-orange-600', bg: 'bg-orange-100', icon: Package },
      shipped: { label: 'Enviado', color: 'text-purple-600', bg: 'bg-purple-100', icon: Truck },
      delivered: { label: 'Entregue', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
    };
    return statusMap[status];
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
    <>
      {/* Header da Página */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Meus Pedidos
            </h1>
            <p className="text-lg text-gray-600">
              Acompanhe o status e histórico de suas compras
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por número do pedido ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="md:w-64">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Aguardando Pagamento</option>
                <option value="confirmed">Pagamento Confirmado</option>
                <option value="preparing">Preparando Pedido</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
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
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
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
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Header do Pedido */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido {order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              Qtd: {item.quantity} • {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Método de Pagamento</p>
                        <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                      </div>
                      {order.trackingCode && (
                        <div>
                          <p className="text-gray-600">Código de Rastreio</p>
                          <p className="font-medium text-gray-900">{order.trackingCode}</p>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          <p className="text-gray-600">Entrega Estimada</p>
                          <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Nota Fiscal
                      </button>
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => router.push(`/products/${order.items[0].productId}?review=true`)}
                          className="flex-1 border border-green-300 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 flex items-center justify-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Avaliar
                        </button>
                      )}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do Pedido {selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
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
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Preço unitário: {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Endereço de Entrega */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Endereço de Entrega
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number}
                      {selectedOrder.shippingAddress.complement && ` - ${selectedOrder.shippingAddress.complement}`}
                    </p>
                    <p className="text-gray-900">
                      {selectedOrder.shippingAddress.neighborhood}, {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-gray-900">CEP: {selectedOrder.shippingAddress.zipCode}</p>
                  </div>
                </div>

                {/* Informações de Pagamento */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Informações de Pagamento
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">Método: {selectedOrder.paymentMethod}</p>
                    <p className="text-gray-900">Total: {formatPrice(selectedOrder.total)}</p>
                    {selectedOrder.trackingCode && (
                      <p className="text-gray-900">Rastreio: {selectedOrder.trackingCode}</p>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <p className="text-gray-900">Entrega estimada: {formatDate(selectedOrder.estimatedDelivery)}</p>
                    )}
                  </div>
                </div>

                {/* Data do Pedido */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data do Pedido
                  </h3>
                  <p className="text-gray-900">{formatDate(selectedOrder.date)}</p>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Nota Fiscal
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 