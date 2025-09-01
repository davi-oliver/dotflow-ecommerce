'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { dotflowAPI, Order } from '@/lib/dotflow-api';
import { 
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Lock,
  Shield,
  Truck,
  Clock,
  Sparkles,
  Zap,
  Star,
  Heart,
  Package,
  CreditCard as CreditCardIcon,
  Smartphone,
  FileText,
  Calendar,
  User,
  Home,
  Building,
  Gift,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface CheckoutAddress {
  id: number;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit' | 'debit' | 'pix' | 'boleto';
  icon: React.ReactNode;
  description: string;
  color: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { customer, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Estados do checkout
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Estados para novo endereço
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<CheckoutAddress>>({
    type: 'home',
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Endereços de exemplo
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([
    {
      id: 1,
      type: 'home',
      name: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      name: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false
    }
  ]);

  // Métodos de pagamento modernos
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit',
      name: 'Cartão de Crédito',
      type: 'credit',
      icon: <CreditCardIcon className="w-6 h-6" />,
      description: 'Visa, Mastercard, Elo, American Express',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'debit',
      name: 'Cartão de Débito',
      type: 'debit',
      icon: <CreditCardIcon className="w-6 h-6" />,
      description: 'Débito automático em conta',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'pix',
      name: 'PIX',
      type: 'pix',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pagamento instantâneo',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      type: 'boleto',
      icon: <FileText className="w-6 h-6" />,
      description: 'Vencimento em 3 dias úteis',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Opções de frete modernas
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Frete Padrão',
      price: 15.90,
      days: '5-7 dias úteis',
      icon: Truck,
      color: 'from-gray-500 to-gray-600',
      description: 'Entrega econômica'
    },
    {
      id: 'express',
      name: 'Frete Expresso',
      price: 29.90,
      days: '2-3 dias úteis',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      description: 'Entrega rápida'
    },
    {
      id: 'same-day',
      name: 'Entrega no Mesmo Dia',
      price: 49.90,
      days: 'Até 18h',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      description: 'Entrega urgente'
    }
  ];

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (cart.getTotalItems() === 0 && !orderComplete) {
      router.push('/');
    }
  }, [cart.getTotalItems(), orderComplete, router]);

  // Selecionar endereço padrão
  useEffect(() => {
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [addresses]);

  // Carregar endereços da API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await dotflowAPI.getAddresses();
        const apiAddresses = response.addresses || [];
        
        if (apiAddresses.length > 0) {
          const mappedAddresses = apiAddresses.map(mapApiAddressToLocal);
          setAddresses(mappedAddresses);
          console.log('✅ Endereços carregados da API:', apiAddresses.length);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar endereços da API:', error);
        // Manter endereços de exemplo se a API falhar
      }
    };

    loadAddresses();
  }, []);

  // Função para mapear endereço da API para interface local
  const mapApiAddressToLocal = (apiAddress: {
    id: number;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    created_at: string;
    updated_at: string;
  }): CheckoutAddress => ({
    id: apiAddress.id,
    type: 'home', // Valor padrão já que a API não tem type
    name: `${apiAddress.street}, ${apiAddress.number}`, // Nome baseado no endereço
    street: apiAddress.street,
    number: apiAddress.number,
    complement: apiAddress.complement,
    neighborhood: apiAddress.neighborhood,
    city: apiAddress.city,
    state: apiAddress.state,
    zipCode: apiAddress.zip_code,
    isDefault: false // Valor padrão já que a API não tem is_default
  });

  // Funções para gerenciar endereços
  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.number || 
        !newAddress.neighborhood || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar dados para a API
      const addressData = {
        street: newAddress.street,
        number: newAddress.number,
        complement: newAddress.complement,
        neighborhood: newAddress.neighborhood,
        city: newAddress.city,
        state: newAddress.state,
        country: 'Brasil', // Valor padrão
        zip_code: newAddress.zipCode
      };

      // Salvar na API
      const response = await dotflowAPI.createAddress(addressData);
      const savedAddress = response.address;

      // Adicionar à lista local
      const mappedAddress = mapApiAddressToLocal(savedAddress);
      setAddresses(prev => [...prev, mappedAddress]);
      setSelectedAddress(mappedAddress);
      setShowAddressForm(false);
      
      // Limpar formulário
      setNewAddress({
        type: 'home',
        name: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });

      console.log('✅ Endereço salvo na API:', savedAddress);
      
    } catch (error) {
      console.error('❌ Erro ao salvar endereço:', error);
      alert('Erro ao salvar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (addresses.length <= 1) {
      alert('Você precisa ter pelo menos um endereço cadastrado');
      return;
    }

    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (addressToDelete?.isDefault) {
      alert('Não é possível excluir o endereço padrão. Defina outro endereço como padrão primeiro.');
      return;
    }

    try {
      setLoading(true);
      
      // Deletar na API (se o endpoint existir)
      // await dotflowAPI.deleteAddress(addressId);
      
      // Remover da lista local
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // Se o endereço excluído era o selecionado, selecionar o primeiro disponível
      if (selectedAddress?.id === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddress(remainingAddresses[0]);
        }
      }

      console.log('✅ Endereço removido:', addressId);
      
    } catch (error) {
      console.error('❌ Erro ao deletar endereço:', error);
      alert('Erro ao deletar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      setLoading(true);
      
      // Atualizar na API (se o endpoint existir)
      // await dotflowAPI.setDefaultAddress(addressId);
      
      // Atualizar na lista local
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));

      console.log('✅ Endereço definido como padrão:', addressId);
      
    } catch (error) {
      console.error('❌ Erro ao definir endereço padrão:', error);
      alert('Erro ao definir endereço padrão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totais
  const subtotal = cart.getTotalPrice();
  const shippingPrice = shippingOptions.find(option => option.id === shippingMethod)?.price || 0;
  const discount = couponDiscount;
  const total = subtotal + shippingPrice - discount;

  // Aplicar cupom
  const applyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }
    
    if (couponCode.toLowerCase() === 'desconto10') {
      setCouponDiscount(subtotal * 0.1);
      setCouponApplied(true);
      setCouponError('');
    } else if (couponCode.toLowerCase() === 'fretegratis') {
      setCouponDiscount(shippingPrice);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Cupom inválido ou expirado');
    }
  };

  // Remover cupom
  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError('');
  };

  // Navegar entre etapas
  const nextStep = () => {
    if (currentStep === 1 && cart.getTotalItems() === 0) {
      alert('Adicione produtos ao carrinho para continuar');
      return;
    }
    if (currentStep === 2 && !selectedAddress) {
      alert('Selecione um endereço de entrega');
      return;
    }
    if (currentStep === 3 && !selectedPayment) {
      alert('Selecione um método de pagamento');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Finalizar pedido
  const finishOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert('Por favor, selecione um endereço e método de pagamento');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados do pedido
      const orderItems = cart.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price_offer || item.product.price,
        total_price: (item.product.price_offer || item.product.price) * item.quantity
      }));

      const orderData: Partial<Order> = {
        customer_id: customer?.id || 1, // Usar ID do usuário logado ou fallback
        total_amount: total,
        status: 'pending',
        shipping_address: {
          street: selectedAddress.street,
          number: selectedAddress.number,
          complement: selectedAddress.complement,
          neighborhood: selectedAddress.neighborhood,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip_code: selectedAddress.zipCode
        },
        payment_method: selectedPayment.name,
        shipping_method: shippingOptions.find(option => option.id === shippingMethod)?.name || 'Standard',
        order_items: orderItems
      };

      console.log('📦 Criando pedido na API DotFlow:', orderData);

      // Criar pedido na API
      const response = await dotflowAPI.createOrder(orderData);
      
      if (response.success) {
        const newOrderId = response.order?.id || `ORD-${Date.now()}`;
        setOrderId(newOrderId.toString());
        setOrderComplete(true);
        
        // Limpar carrinho
        cart.clearCart();
        
        console.log('✅ Pedido criado com sucesso na API DotFlow!');
        console.log('📋 ID do Pedido:', newOrderId);
        console.log('💰 Total:', formatPrice(total));
        console.log('📦 Itens:', cart.items.length);
      } else {
        throw new Error(response.message || 'Erro ao criar pedido');
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando checkout...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Pedido Confirmado!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Seu pedido foi processado com sucesso. Você receberá um email de confirmação em breve.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Número do Pedido</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{orderId}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Pago:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Método de Pagamento:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment?.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Entrega:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedAddress?.street}, {selectedAddress?.number}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Acompanhar Pedido
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-700 dark:via-purple-700 dark:to-blue-900 text-white py-12 rounded-xl mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Finalizar Compra
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Complete seu pedido em algumas etapas simples e seguras
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { step: 1, title: 'Carrinho', icon: ShoppingCart },
              { step: 2, title: 'Endereço', icon: MapPin },
              { step: 3, title: 'Pagamento', icon: CreditCard },
              { step: 4, title: 'Confirmação', icon: CheckCircle }
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white shadow-lg' :
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-semibold transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-400' :
                    isCompleted ? 'text-green-600 dark:text-green-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.title}
                  </span>
                  {index < 3 && (
                    <div className={`w-20 h-1 mx-6 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Etapa 1: Carrinho */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Itens do Carrinho</h2>
                </div>
                
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{item.product.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatPrice(item.product.price_offer || item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                        <button
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => cart.removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 2: Endereço */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Endereço de Entrega</h2>
                </div>
                
                <div className="grid gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              address.type === 'home' ? 'bg-blue-100 dark:bg-blue-900/20' :
                              address.type === 'work' ? 'bg-green-100 dark:bg-green-900/20' :
                              'bg-purple-100 dark:bg-purple-900/20'
                            }`}>
                              {address.type === 'home' ? <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" /> :
                               address.type === 'work' ? <Building className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                               <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                              address.type === 'home' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              address.type === 'work' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                              {address.type === 'home' ? 'Casa' : address.type === 'work' ? 'Trabalho' : 'Outro'}
                            </span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                                Padrão
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">{address.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {address.neighborhood}, {address.city} - {address.state}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">CEP: {address.zipCode}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedAddress?.id === address.id && (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {!address.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(address.id);
                              }}
                              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Definir como padrão"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir endereço"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botão Adicionar Novo Endereço */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Adicionar Novo Endereço</span>
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 3: Pagamento */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Método de Pagamento */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Método de Pagamento</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedPayment?.id === method.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                              {method.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{method.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{method.description}</p>
                            </div>
                          </div>
                          {selectedPayment?.id === method.id && (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opções de Frete */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Opções de Entrega</h2>
                  </div>
                  
                  <div className="grid gap-4">
                    {shippingOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setShippingMethod(option.id)}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            shippingMethod === option.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{option.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">{option.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">{option.days}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                {formatPrice(option.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 4: Confirmação */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Confirmação do Pedido</h2>
                </div>
                
                <div className="space-y-8">
                  {/* Resumo dos Itens */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Itens do Pedido
                    </h3>
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Qtd: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice((item.product.price_offer || item.product.price) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Endereço de Entrega
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {selectedAddress?.street}, {selectedAddress?.number}
                        {selectedAddress?.complement && ` - ${selectedAddress.complement}`}
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedAddress?.neighborhood}, {selectedAddress?.city} - {selectedAddress?.state}
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">CEP: {selectedAddress?.zipCode}</p>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Método de Pagamento
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedPayment?.name}</p>
                    </div>
                  </div>

                  {/* Opção de Entrega */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Opção de Entrega
                    </h3>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {shippingOptions.find(option => option.id === shippingMethod)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resumo e Cupom */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Resumo do Pedido
              </h2>
              
              {/* Cupom */}
              <div className="mb-6">
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {!couponApplied ? (
                    <button
                      onClick={applyCoupon}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                    >
                      Aplicar
                    </button>
                  ) : (
                    <button
                      onClick={removeCoupon}
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {couponApplied && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span>Cupom aplicado! Desconto de {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {couponError && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Resumo dos Valores */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Frete:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(shippingPrice)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-600 dark:text-green-400">Desconto:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <hr className="border-gray-200 dark:border-gray-600" />
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Botões de Navegação */}
              <div className="space-y-4">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center"
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={finishOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Finalizar Pedido
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Informações de Segurança */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Dados criptografados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Novo Endereço */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Novo Endereço
                </h2>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo de Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Tipo de Endereço
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'home', label: 'Casa', icon: Home },
                        { value: 'work', label: 'Trabalho', icon: Building },
                        { value: 'other', label: 'Outro', icon: User }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewAddress(prev => ({ ...prev, type: type.value as 'home' | 'work' | 'other' }))}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            newAddress.type === type.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <type.icon className={`w-6 h-6 ${
                            newAddress.type === type.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            newAddress.type === type.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nome do Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Endereço *
                    </label>
                    <input
                      type="text"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Casa, Trabalho, Apartamento"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="00000-000"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Rua */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rua *
                    </label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="Nome da rua"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Número */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={newAddress.number}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="123"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, complement: e.target.value }))}
                      placeholder="Apto, Bloco, etc."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Bairro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Nome do bairro"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Nome da cidade"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="SP, RJ, MG, etc."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Endereço Padrão */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Definir como endereço padrão
                      </span>
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Salvar Endereço
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 