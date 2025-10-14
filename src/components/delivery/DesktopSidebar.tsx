'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingCart, Heart, Star, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopSidebar({ isOpen, onClose }: DesktopSidebarProps) {
  const { customer, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/delivery');
  };

  if (!isOpen) return null;

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🍕</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Go Pizza</h2>
              <p className="text-sm text-gray-600">Delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informações da Loja */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Status da Loja</span>
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium">
            Loja fechada • Abre amanhã às 00:00
          </div>
          
          <div className="flex items-center gap-2 mt-4 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Localização</span>
          </div>
          <p className="text-sm text-gray-800">2.4 km • Min R$ 35,00</p>
          
          <div className="flex items-center gap-2 mt-4 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">Avaliação</span>
          </div>
          <p className="text-sm text-gray-800">4.9 (557 avaliações)</p>
        </div>

        {/* Navegação */}
        <nav className="space-y-2">
          <button
            onClick={() => router.push('/delivery')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Cardápio</span>
          </button>
          
          <button
            onClick={() => router.push('/orders')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Meus Pedidos</span>
          </button>
          
          <button
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Favoritos</span>
          </button>
        </nav>

        {/* Perfil do Usuário */}
        {isAuthenticated && customer && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left p-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {/* Botão de Login para usuários não autenticados */}
        {!isAuthenticated && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
