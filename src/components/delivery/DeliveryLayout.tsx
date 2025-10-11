'use client';

import { ReactNode } from 'react';
import { DeliveryHeader } from './DeliveryHeader';

interface DeliveryLayoutProps {
  children: ReactNode;
}

export function DeliveryLayout({ children }: DeliveryLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DeliveryHeader />
      <main>{children}</main>
    </div>
  );
}

