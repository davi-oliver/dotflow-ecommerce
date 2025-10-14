'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutService } from '@/services/checkoutService';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product } from '@/types/dotflow';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Lock,
  Shield,
  CreditCard,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function ShoppingCartSidebar() {
  const router = useRouter();
  const cart = useCart();
  const { customer, isAuthenticated, isLoading } = useAuth();
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
    
    // Verificar se está carregando a autenticação
    if (isLoading) {
      return;
    }
    
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      cart.closeCart();
      // Salvar o carrinho no localStorage para restaurar após login
      localStorage.setItem('dotflow-cart-backup', JSON.stringify(cart.items));
      // Redirecionar para login com returnUrl
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}&checkout=true`);
      return;
    }
    
    setIsCheckingOut(true);
    
    try {
      // Fechar o modal do carrinho imediatamente
      cart.closeCart();
      
      // Redirecionar para checkout externo
      await CheckoutService.redirectToExternalCheckout(
        cart.items,
        customer?.id,
        customer?.name,
        customer?.phone,
        appliedCoupon || undefined
      );
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert('Erro ao processar checkout. Tente novamente.');
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
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Seu Pedido
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cart.getTotalItems()} {cart.getTotalItems() === 1 ? 'item' : 'itens'}
                  </p>
                </div>
            </div>
            <button
              onClick={cart.closeCart}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Seu carrinho está vazio
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                  Adicione pizzas deliciosas ao seu pedido e aproveite!
                </p>
                <button
                  onClick={cart.closeCart}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex gap-3 p-3">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={item.product.link_product || getProductImage(item.product.name)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/pizza-brocolis-bacon-classica.jpeg';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {/* Nome e Botão Remover */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">
                          {item.product.name}
                        </h3>
                          <button
                            onClick={() => cart.removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Delivery Options */}
                        {item.options && (
                          <div className="space-y-1 mb-2">
                            {item.options.size && (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium">
                                  Tam. {item.options.size}
                                </span>
                              </div>
                            )}
                            {item.options.flavors && item.options.flavors.length > 1 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">🍕</span> {item.options.flavors.map(f => f.name).join(' + ')}
                              </div>
                            )}
                            {item.options.border && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">🥖</span> {item.options.border.name}
                              </div>
                            )}
                            {item.options.extras && item.options.extras.length > 0 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">🧀</span> {item.options.extras.map(e => e.name).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-current transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            {item.product.price_offer && item.product.price_offer < item.product.price ? (
                              <div className="flex flex-col items-end">
                                <span className="font-bold text-red-600 dark:text-red-400 text-base">
                                  {formatPrice(item.product.price_offer)}
                                </span>
                                <span className="text-gray-400 text-xs line-through">
                                  {formatPrice(item.product.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                {formatPrice(item.product.price)}
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
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              {/* Cupom de Desconto */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🎟️ Cupom de Desconto
                </h3>
                
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
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4">
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

              {/* Botão Continuar Comprando */}
              <button
                onClick={cart.closeCart}
                className="w-full mb-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 py-3 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continuar Comprando
              </button>

              {/* Mensagem para usuário não logado */}
              {!isAuthenticated && !isLoading && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                    🔐 Faça login para finalizar sua compra
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isLoading}
                data-checkout-button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Redirecionando...</span>
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Fazer Login</span>
                    <ArrowRight className="w-5 h-5" />
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
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-red-600" />
                  <span>Pagamento</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-red-600" />
                  <span>Entrega</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 