'use client';

import { ShoppingCart } from 'lucide-react';

interface CartFloatingButtonProps {
  itemCount: number;
  totalPrice: number;
  onCartClick: () => void;
}

export function CartFloatingButton({ itemCount, totalPrice, onCartClick }: CartFloatingButtonProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 lg:bottom-8 lg:right-8 lg:left-auto lg:transform-none z-40">
      <button
        onClick={onCartClick}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 lg:px-8 lg:py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-4"
      >
        {/* Ícone com Badge */}
        <div className="relative">
          <ShoppingCart className="w-6 h-6 lg:w-7 lg:h-7" />
          <span className="absolute -top-3 -right-3 bg-white text-red-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {itemCount}
          </span>
        </div>
        
        {/* Texto */}
        <div className="text-left">
          <div className="text-xs lg:text-sm font-medium opacity-90">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </div>
          <div className="text-lg lg:text-xl font-bold">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </button>
    </div>
  );
}
