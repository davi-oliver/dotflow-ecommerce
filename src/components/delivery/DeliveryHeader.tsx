'use client';

import { ShoppingCart, Heart, User, LogOut, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeliveryHeaderProps {
  onMenuClick?: () => void;
}

export function DeliveryHeader({ onMenuClick }: DeliveryHeaderProps) {
  const cart = useCart();
  const { customer, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/delivery');
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo e Menu */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Botão do menu */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Logo */}
            <button
              onClick={() => router.push('/delivery')}
              className="flex items-center gap-2 lg:gap-3 group"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all">
                <span className="text-2xl lg:text-3xl">🍕</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg lg:text-xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  Go Pizza
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Delivery
                </div>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Favoritos (apenas desktop) */}
            <button className="hidden lg:flex p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group">
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            </button>
              
            {/* Carrinho */}
            <button 
              onClick={cart.openCart}
              className="relative p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {cart.getTotalItems()}
                </span>
              )}
            </button>
              
            {/* Menu do Usuário */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 lg:gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-sm lg:text-base font-bold">
                      {customer?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {customer?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Overlay para fechar o menu */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {customer?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {customer?.email || customer?.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          router.push('/profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </button>
                      <button
                        onClick={() => {
                          router.push('/orders');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Meus Pedidos
                      </button>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-semibold"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
