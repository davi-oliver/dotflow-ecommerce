'use client';

import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DeliveryNavigation } from './DeliveryNavigation';

export function DeliveryHeader() {
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
    <>
      <DeliveryNavigation />
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/delivery')}
              className="text-xl font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-2"
            >
              🍕 Pizza Delivery
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Favoritos */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
              
            {/* Carrinho */}
            <button 
              onClick={cart.openCart}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {cart.getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.getTotalItems()}
                </span>
              )}
            </button>
              
            {/* Menu do Usuário */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {customer?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {customer?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        router.push('/orders');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <ShoppingCart className="w-4 h-4 mr-3" />
                      Meus Pedidos
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
