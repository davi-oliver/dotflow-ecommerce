'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { ShoppingCartSidebar } from './ShoppingCart';
import { CartProvider } from '@/contexts/CartContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isDeliveryRoute = pathname.startsWith('/delivery');

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {!isDeliveryRoute && <Header />}
        
        <main>
          {children}
        </main>

        <ShoppingCartSidebar />
      </div>
    </CartProvider>
  );
} 