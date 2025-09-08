'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  ArrowRight,
  Lock,
  Shield,
  CreditCard,
  Truck,
  CheckCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export function ShoppingCartSidebar() {
  const router = useRouter();
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    
    setIsCheckingOut(true);
    // Fechar o modal do carrinho imediatamente
    cart.closeCart();
    
    setTimeout(() => {
      router.push('/checkout');
      setIsCheckingOut(false);
    }, 500);
  };

  const getDiscountPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
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
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Carrinho
              </h2>
              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold px-2 py-1 rounded-full">
                {cart.getTotalItems()}
              </span>
            </div>
            <button
              onClick={cart.closeCart}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Carrinho Vazio
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Adicione produtos ao seu carrinho para começar a comprar
                </p>
                <button
                  onClick={cart.closeCart}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                          {item.product.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2 mt-1">
                          {item.product.price_offer && item.product.price_offer < item.product.price ? (
                            <>
                              <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                {formatPrice(item.product.price_offer)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs line-through">
                                {formatPrice(item.product.price)}
                              </span>
                              <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-1 py-0.5 rounded">
                                -{getDiscountPercentage(item.product.price, item.product.price_offer)}%
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => cart.removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(cart.getTotalPrice())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Frete:</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    Grátis
                  </span>
                </div>
                <hr className="border-gray-200 dark:border-gray-600" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(cart.getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Redirecionando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Finalizar Compra</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CreditCard className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Pagamento</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3 text-orange-600 dark:text-orange-400" />
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