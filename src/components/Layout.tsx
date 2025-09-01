'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { ShoppingCartSidebar } from './ShoppingCart';
import { CartProvider } from '@/contexts/CartContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main>
          {children}
        </main>

        <ShoppingCartSidebar />
      </div>
    </CartProvider>
  );
} 