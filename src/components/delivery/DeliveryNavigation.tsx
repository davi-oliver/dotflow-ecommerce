'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export function DeliveryNavigation() {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao E-commerce</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Loja</span>
            </button>
            <button
              onClick={() => router.push('/delivery')}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-medium">Delivery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

