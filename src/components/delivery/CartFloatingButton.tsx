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
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onCartClick}
        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">Ver Carrinho</div>
          <div className="text-lg font-bold">{formatPrice(totalPrice)}</div>
        </div>
      </button>
    </div>
  );
}

