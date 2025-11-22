'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MessageCircle,
  ArrowLeft,
  Phone,
  HelpCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';

interface Order {
  id: number;
  order_id: string;
  customer_id: number;
  company_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_status: string;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999';
const WHATSAPP_SUPPORT = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || '5511999999999';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      // Buscar pedido via API
      const apiKey = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || '';
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        const orderData = data.order || data;
        
        // Garantir que amount seja um número
        if (orderData.amount !== undefined) {
          orderData.amount = typeof orderData.amount === 'string' 
            ? parseFloat(orderData.amount) 
            : Number(orderData.amount);
        } else if (orderData.total_amount !== undefined) {
          // Se não tiver amount, usar total_amount
          orderData.amount = typeof orderData.total_amount === 'string'
            ? parseFloat(orderData.total_amount)
            : Number(orderData.total_amount);
        }
        
        setOrder(orderData);
      } else {
        // Se não encontrar, usar dados mockados para demonstração
        setOrder({
          id: parseInt(orderId) || 1,
          order_id: orderId,
          customer_id: 1,
          company_id: 12,
          amount: 118.40,
          currency: 'brl',
          status: 'pending_payment',
          payment_method: 'credit_card',
          payment_status: 'pending',
          description: 'Pedido do ecommerce',
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast.error('Erro ao carregar informações do pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
      'pending_payment': {
        label: 'Aguardando Pagamento',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      'paid': {
        label: 'Pago',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'processing': {
        label: 'Pedido em Preparação',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      'pending_pickup': {
        label: 'Pedido em Preparação',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      'shipped': {
        label: 'Enviado',
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      'delivered': {
        label: 'Entregue',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'cancelled': {
        label: 'Cancelado',
        icon: X,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    };

    return statusMap[status] || {
      label: status,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === null) {
      return 'R$ 0,00';
    }
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    if (isNaN(numPrice)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDeliveryTime = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const deliveryTime = new Date(orderDate.getTime() + 60 * 60 * 1000); // Adiciona 60 minutos
    
    return deliveryTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openWhatsApp = (phone: string, message?: string) => {
    const encodedMessage = message ? encodeURIComponent(message) : '';
    const url = `https://wa.me/${phone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
    window.open(url, '_blank');
  };

  const handleTrackOrder = () => {
    const message = `Olá! Gostaria de acompanhar o pedido #${orderId}`;
    openWhatsApp(WHATSAPP_NUMBER, message);
  };

  const handleSupport = () => {
    const message = 'Olá! Preciso de ajuda com meu pedido.';
    openWhatsApp(WHATSAPP_SUPPORT, message);
  };

  // Extrair itens do pedido do metadata
  const getOrderItems = () => {
    if (!order.metadata) return [];

    const items: Array<{
      index: number;
      product_id?: number;
      name: string;
      price: number;
      quantity: number;
      options?: Record<string, unknown>;
      sku?: string;
    }> = [];

    // Buscar todos os itens no metadata
    let index = 0;
    while (order.metadata[`item_${index}`] || order.metadata[`product_id_${index}`]) {
      const name = order.metadata[`item_${index}`] as string || `Produto ${index + 1}`;
      const price = (order.metadata[`product_price_${index}`] as number) || 0;
      const quantity = (order.metadata[`product_qty_${index}`] as number) || 1;
      const productId = order.metadata[`product_id_${index}`] as number;
      const sku = order.metadata[`product_sku_${index}`] as string;
      const options = order.metadata[`options_${index}`] as Record<string, unknown>;

      items.push({
        index,
        product_id: productId,
        name,
        price,
        quantity,
        options,
        sku,
      });

      index++;
    }

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando informações do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Pedido não encontrado</p>
            <button
              onClick={() => router.push('/delivery')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Voltar para o cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DeliveryHeader />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Acompanhamento do Pedido
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Pedido #{order.order_id || order.id}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {statusInfo.label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pedido realizado em {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tempo de Entrega */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tempo de entrega: <span className="font-semibold">60 minutos</span>
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Prazo final:</span>{' '}
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {calculateDeliveryTime(order.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {getOrderItems().length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Itens do Pedido
            </h3>
            
            <div className="space-y-4">
              {getOrderItems().map((item, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h4>
                      {item.sku && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          SKU: {item.sku}
                        </p>
                      )}
                      {item.options && (
                        <div className="mt-2 space-y-1">
                          {item.options.size && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Tamanho:</span> {String(item.options.size)}
                            </p>
                          )}
                          {item.options.flavors && Array.isArray(item.options.flavors) && item.options.flavors.length > 0 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Sabores:</span>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {(item.options.flavors as Array<{ name?: string }>).map((flavor, fIdx) => (
                                  <li key={fIdx}>{flavor.name || `Sabor ${fIdx + 1}`}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.options.border && typeof item.options.border === 'object' && (item.options.border as { name?: string }).name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Borda:</span> {(item.options.border as { name: string }).name}
                            </p>
                          )}
                          {item.options.extras && Array.isArray(item.options.extras) && item.options.extras.length > 0 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Extras:</span>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {(item.options.extras as Array<{ name?: string }>).map((extra, eIdx) => (
                                  <li key={eIdx}>{extra.name || `Extra ${eIdx + 1}`}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qtd: {item.quantity}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Resumo do Pedido
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Valor Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(order.amount || order.total_amount || 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Forma de Pagamento</span>
              <span className="text-gray-900 dark:text-gray-100 capitalize">
                {order.payment_method === 'credit_card' ? 'Cartão de Crédito' : order.payment_method}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Status do Pagamento</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleTrackOrder}
            className="flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Acompanhar via WhatsApp</span>
          </button>
          
          <button
            onClick={handleSupport}
            className="flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Falar com Suporte</span>
          </button>
          </div>

          {/* Additional Info */}
          {order.description && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Observações
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {order.description}
            </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

