'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { dotflowAPI } from '@/lib/dotflow-api';
import { appConfig } from '@/config/app';
import { Product } from '@/types/dotflow';
import toast from 'react-hot-toast';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Shield,
  CreditCard,
  Truck,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';

export function ShoppingCartSidebar() {
  const router = useRouter();
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [beverages, setBeverages] = useState<Product[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Estados para dados do pedido
  const [phone, setPhone] = useState('');
  const [showAddressAndPayment, setShowAddressAndPayment] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [customerName, setCustomerName] = useState('');

  // Função para formatar telefone com máscara
  const formatPhone = (value: string) => {
    // Remove sufixo do WhatsApp (@s.whatsapp.net)
    let cleanValue = value.replace(/@s\.whatsapp\.net/gi, '');
    
    // Remove tudo que não é número
    const numbers = cleanValue.replace(/\D/g, '');
    
    // Aplica a máscara baseado no tamanho
    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : '';
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      // Telefone celular (11 dígitos)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Carregar dados pré-preenchidos do localStorage (se vieram da URL)
  // Executa quando o carrinho é aberto para garantir que os dados estejam disponíveis
  useEffect(() => {
    if (!cart.isOpen) return;

    const loadCustomerData = () => {
      const savedPhone = localStorage.getItem('delivery_customer_phone');
      const savedName = localStorage.getItem('delivery_customer_name');
      const savedAddress = localStorage.getItem('delivery_customer_address');

      // Sempre atualizar telefone se houver no localStorage (pode ter sido atualizado)
      if (savedPhone) {
        // Formatar telefone se vier apenas com números
        const formattedPhone = formatPhone(savedPhone);
        // Só atualizar se for diferente do atual (evita loops)
        if (formattedPhone !== phone) {
          setPhone(formattedPhone);
          console.log('📱 Telefone carregado do localStorage:', formattedPhone);
        }
      }
      
      // Sempre atualizar nome se houver no localStorage
      if (savedName && savedName !== customerName) {
        setCustomerName(savedName);
        console.log('👤 Nome carregado do localStorage:', savedName);
      }
      
      // Carregar endereço se houver
      if (savedAddress) {
        try {
          const address = JSON.parse(savedAddress);
          setDeliveryAddress(prev => {
            // Só atualizar se houver mudanças
            const hasChanges = 
              address.street !== prev.street ||
              address.number !== prev.number ||
              address.neighborhood !== prev.neighborhood ||
              address.zip_code !== prev.zip_code;
            
            if (hasChanges) {
              return {
                ...prev,
                ...address
              };
            }
            return prev;
          });
          
          // Se tem endereço, mostrar formulário expandido
          if (address.street || address.zip_code) {
            setShowAddressAndPayment(true);
          }
          console.log('📍 Endereço carregado do localStorage');
        } catch (error) {
          console.error('Erro ao carregar endereço:', error);
        }
      }
    };

    // Carregar imediatamente
    loadCustomerData();

    // Também verificar periodicamente enquanto o carrinho está aberto (para casos de timing)
    const interval = setInterval(loadCustomerData, 500);
    
    return () => clearInterval(interval);
  }, [cart.isOpen, phone, customerName]);
  const [cepLoading, setCepLoading] = useState(false);

  // Carregar bebidas da API
  useEffect(() => {
    const loadBeverages = async () => {
      try {
        const response = await dotflowAPI.getProducts();
        const drinks = response.products.filter(p => p.category_id === 15 && p.active);
        setBeverages(drinks);
      } catch (error) {
        console.error('Erro ao carregar bebidas:', error);
      }
    };
    
    if (cart.isOpen) {
      loadBeverages();
    }
  }, [cart.isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Função para formatar CEP com máscara
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  // Função para buscar CEP na API ViaCEP
  const fetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return;
    }

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setDeliveryAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      } else {
        // CEP não encontrado
        console.log('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setDeliveryAddress({...deliveryAddress, zip_code: formatted});
    
    // Buscar CEP quando tiver 8 dígitos
    const cleanCEP = formatted.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      fetchCEP(formatted);
    }
  };

  const getProductImage = (productName: string) => {
    const name = productName.toLowerCase();
    
    const imageMap: Record<string, string> = {
      'americana': '/americana.jpeg',
      'calabresa': '/calabresa.jpeg',
      'portuguesa': '/portuguesa.jpeg',
      'marguerita': '/marguerita.jpeg',
      'quatro queijos': '/4queijos.jpeg',
      'presunto': '/presunto.jpeg',
      'milho': '/milho.jpeg',
      'brócolis': '/brocolis-bacon.jpeg',
      'frango catupiry': '/frango-catupiry.jpeg',
      'frango cheddar': '/frango-cheddar.jpeg',
      'go pizza': '/gopizza.jpeg',
      'chocolate': '/choconinho.jpeg',
      'bis': '/bis.jpeg',
      'sensação': '/sensacao.jpeg'
    };
    
    for (const [key, value] of Object.entries(imageMap)) {
      if (name.includes(key)) {
        return value;
      }
    }
    
    return '/pizza-brocolis-bacon-classica.jpeg';
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    
    // Validar telefone
    if (!phone.trim()) {
      toast.error('Por favor, informe seu telefone');
      return;
    }
    
    // Validar nome (sempre obrigatório)
    const finalCustomerName = customerName.trim() || 'Cliente';
    
    setIsCheckingOut(true);
    
    try {
      // Preparar itens do pedido
      const orderItems = cart.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price_offer || item.product.price,
        discount_amount: item.product.price_offer ? 
          (item.product.price - item.product.price_offer) * item.quantity : 0,
        notes: item.options ? JSON.stringify(item.options) : null,
        metadata: {
          product_name: item.product.name,
          product_sku: item.product.sku,
          options: item.options
        }
      }));
      
      // Calcular totais
      const subtotal = cart.getTotalPrice();
      const discountAmount = calculateDiscount();
      const shippingAmount = appConfig.defaultShippingAmount;
      const taxAmount = appConfig.defaultTaxAmount;
      const totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;
      
      // Verificar se há token salvo (vindo da URL)
      const savedToken = localStorage.getItem('delivery_customer_token');
      const savedRef = localStorage.getItem('delivery_customer_ref');
      
      // Preparar dados do pedido
      const orderData = {
        phone: phone.trim(),
        customer_name: finalCustomerName,
        corporate_id: appConfig.corporateId,
        ...(savedToken && { token: savedToken }), // Incluir token se disponível
        ...(savedRef && { ref: savedRef }), // Incluir ref se disponível
        items: orderItems,
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending_payment',
        delivery_address: showAddressAndPayment && deliveryAddress.street ? deliveryAddress : undefined,
        metadata: {
          source: 'ecommerce',
          coupon_code: appliedCoupon?.code,
          coupon_discount: appliedCoupon ? discountAmount : 0
        }
      };
      
      // Criar pedido via API
      const apiKey = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || appConfig.apiKey;
      const response = await fetch('/api/orders/create-from-ecommerce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pedido');
      }
      
      const result = await response.json();
      
      // Fechar o modal do carrinho
      cart.closeCart();
      
      // Limpar carrinho
      cart.clearCart();
      
      // Limpar dados do localStorage (incluindo token)
      localStorage.removeItem('delivery_customer_phone');
      localStorage.removeItem('delivery_customer_name');
      localStorage.removeItem('delivery_customer_address');
      localStorage.removeItem('delivery_customer_token');
      localStorage.removeItem('delivery_customer_ref');
      
      // Obter ID do pedido da resposta
      const orderId = result.order_id || result.order?.order_number || result.order?.id || result.id;
      
      // Mostrar mensagem de sucesso e redirecionar para página de acompanhamento
      toast.success(`Pedido criado com sucesso! Número: ${orderId}`);
      
      // Redirecionar para página de acompanhamento
      if (orderId) {
        router.push(`/order-tracking/${orderId}`);
      } else {
        // Fallback: redirecionar para página de pedidos se não houver ID
        router.push('/orders');
      }
      
    } catch (error: any) {
      console.error('❌ Erro no checkout:', error);
      toast.error(error.message || 'Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsCheckingOut(false);
    }
  };


  const handleAddBeverage = (beverage: Product) => {
    // Adicionar bebida sem opções personalizadas
    cart.addItem(beverage, 1, {
      size: 'G',
      flavors: [beverage],
      extras: [],
      quantity: 1
    });
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('beverages-carousel');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Funções para cupom de desconto
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Simular validação do cupom (substitua pela API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cupons de exemplo
      const validCoupons = {
        'DESCONTO10': { discount: 10, type: 'percentage' as const },
        'FRETE15': { discount: 15, type: 'fixed' as const },
        'BEMVINDO': { discount: 20, type: 'percentage' as const }
      };

      const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
      
      if (coupon) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: coupon.discount,
          type: coupon.type
        });
        setCouponError('');
      } else {
        setCouponError('Cupom inválido ou expirado');
      }
    } catch {
      setCouponError('Erro ao validar cupom. Tente novamente.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = cart.getTotalPrice();
    
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  if (!cart.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={cart.closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 p-5 border-b border-red-700 dark:border-red-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Seu Pedido
                  </h2>
                  <p className="text-xs text-red-100 font-medium">
                    {cart.getTotalItems()} {cart.getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
                  </p>
                </div>
              </div>
              <button
                onClick={cart.closeCart}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ring-2 ring-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content - Área scrollável completa */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-3xl flex items-center justify-center mb-6 shadow-lg ring-4 ring-red-100 dark:ring-red-900/30">
                  <ShoppingCart className="w-16 h-16 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Seu carrinho está vazio
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
                  Adicione pizzas deliciosas ao seu pedido e aproveite!
                </p>
                <button
                  onClick={cart.closeCart}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 ring-2 ring-red-500/20 hover:ring-red-500/40"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
              <div className="p-5 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-xl transition-all duration-300 shadow-sm">
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-red-200 dark:group-hover:ring-red-800 transition-all">
                        <img
                          src={item.product.link_product || getProductImage(item.product.name)}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/pizza-brocolis-bacon-classica.jpeg';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {/* Nome e Botão Remover */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight line-clamp-2">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => cart.removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0 hover:scale-110 active:scale-95"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Delivery Options */}
                        {item.options && (
                          <div className="space-y-1.5 mb-3">
                            {item.options.size && (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800">
                                  📏 {item.options.size}
                                </span>
                              </div>
                            )}
                            {item.options.flavors && item.options.flavors.length > 1 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <span className="text-base">🍕</span>
                                <span className="font-medium">{item.options.flavors.map(f => f.name).join(' + ')}</span>
                              </div>
                            )}
                            {item.options.border && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <span className="text-base">🥖</span>
                                <span className="font-medium">{item.options.border.name}</span>
                              </div>
                            )}
                            {item.options.extras && item.options.extras.length > 0 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <span className="text-base">🧀</span>
                                <span className="font-medium">{item.options.extras.map(e => e.name).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1">
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-current transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            {item.product.price_offer && item.product.price_offer < item.product.price ? (
                              <div className="flex flex-col items-end">
                                <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                                  {formatPrice(item.product.price_offer * item.quantity)}
                                </span>
                                <span className="text-gray-400 text-xs line-through">
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Seção de Bebidas */}
                {beverages.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          🥤 Que tal uma bebida?
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => scrollCarousel('left')}
                            className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => scrollCarousel('right')}
                            className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Próximo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Carrossel de Bebidas */}
                      <div 
                        id="beverages-carousel"
                        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {beverages.map((beverage) => (
                          <div
                            key={beverage.id}
                            className="flex-shrink-0 w-32 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg flex items-center justify-center mb-2">
                              <span className="text-4xl">🥤</span>
                            </div>
                            <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 min-h-[2rem]">
                              {beverage.name}
                            </h4>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                                {formatPrice(beverage.price_offer || beverage.price)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddBeverage(beverage)}
                              className="w-full bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-1 text-xs font-semibold active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                              Adicionar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Dentro da área scrollável */}
              <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              {/* Cupom de Desconto */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🎟️</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Cupom de Desconto
                  </h3>
                </div>
                
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Digite o código do cupom"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={couponLoading}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {couponLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </button>
                    </div>
                    
                    {couponError && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {couponError}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cupons válidos: DESCONTO10, FRETE15, BEMVINDO
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✅</span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Cupom {appliedCoupon.code} aplicado!
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
                      >
                        Remover
                      </button>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Desconto: {appliedCoupon.type === 'percentage' 
                        ? `${appliedCoupon.discount}%` 
                        : `R$ ${appliedCoupon.discount.toFixed(2)}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-5 mb-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(cart.getTotalPrice())}
                    </span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Desconto ({appliedCoupon.code})
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        -{formatPrice(calculateDiscount())}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de entrega</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Grátis
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatPrice(cart.getTotalPrice() - calculateDiscount())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulário de Dados do Pedido */}
              <div className="mb-5 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Dados para Finalizar Pedido
                  </h3>
                </div>
                
                {/* Input de Telefone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Telefone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm hover:shadow-md"
                    required
                  />
                </div>
                
                {/* Checkbox para mostrar endereço e forma de pagamento */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    id="showAddressPayment"
                    checked={showAddressAndPayment}
                    onChange={(e) => setShowAddressAndPayment(e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="showAddressPayment" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                    Informar endereço de entrega e forma de pagamento
                  </label>
                </div>
                
                {/* Inputs de Endereço e Forma de Pagamento (condicionais) */}
                {showAddressAndPayment && (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-md animate-in slide-in-from-top-2 duration-300">
                    {/* Nome do Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu nome completo (opcional)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Endereço de Entrega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Endereço de Entrega
                      </label>
                      <div className="space-y-2">
                        {/* CEP - Primeiro campo */}
                        <div className="relative">
                          <input
                            type="text"
                            value={deliveryAddress.zip_code}
                            onChange={handleCEPChange}
                            placeholder="00000-000"
                            maxLength={9}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                          />
                          {cepLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Rua/Avenida - Auto-preenchido pelo CEP */}
                        <input
                          type="text"
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                          placeholder="Rua/Avenida"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        
                        {/* Número e Complemento */}
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={deliveryAddress.number}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, number: e.target.value})}
                            placeholder="Número"
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={deliveryAddress.complement}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, complement: e.target.value})}
                            placeholder="Complemento"
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Bairro - Auto-preenchido pelo CEP */}
                        <input
                          type="text"
                          value={deliveryAddress.neighborhood}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, neighborhood: e.target.value})}
                          placeholder="Bairro"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        
                        {/* Estado */}
                        <input
                          type="text"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value.toUpperCase()})}
                          placeholder="Estado (UF)"
                          maxLength={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                        />
                      </div>
                    </div>
                    
                    {/* Forma de Pagamento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        Forma de Pagamento
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="pix">PIX</option>
                        <option value="cash">Dinheiro</option>
                        <option value="bank_transfer">Transferência Bancária</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Continuar Comprando */}
              <button
                onClick={cart.closeCart}
                className="w-full mb-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 py-3.5 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continuar Comprando
              </button>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || !phone.trim()}
                data-checkout-button
                className="w-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:via-red-700 hover:to-red-800 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] ring-2 ring-red-500/20 hover:ring-red-500/40"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">Seguro</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">Pagamento</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-700 dark:text-purple-300">Entrega</span>
                </div>
              </div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 