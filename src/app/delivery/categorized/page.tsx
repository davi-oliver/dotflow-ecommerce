'use client';

import { useState } from 'react';
import { Product } from '@/types/dotflow';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';
import { ProductGrid } from '@/components/delivery/ProductGrid';
import { ProductModal } from '@/components/delivery/ProductModal';
import { CartFloatingButton } from '@/components/delivery/CartFloatingButton';
import { useCart } from '@/contexts/CartContext';
import { useDeliveryProducts } from '@/hooks/useDeliveryProducts';

export default function CategorizedDeliveryPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'complements'>('main');
  const cart = useCart();
  
  const { 
    mainProducts, 
    complements, 
    loading, 
    error, 
    reloadProducts,
    totalProducts 
  } = useDeliveryProducts();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando cardápio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={reloadProducts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DeliveryHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🍕 Cardápio Digital
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pizzas artesanais feitas com ingredientes frescos
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {totalProducts} produtos disponíveis
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'main'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🍕 Produtos Principais ({mainProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('complements')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'complements'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ➕ Complementos ({complements.length})
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {activeTab === 'main' ? (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-red-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Produtos Principais
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Pizzas, bebidas, sobremesas e promoções (Categorias: 1, 2, 3, 7, 8)
            </p>
            <ProductGrid 
              products={mainProducts}
              onProductSelect={handleProductSelect}
            />
          </section>
        ) : (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-blue-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complementos
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bordas, adicionais e acompanhamentos (Categorias: 4, 5, 6)
            </p>
            <ProductGrid 
              products={complements}
              onProductSelect={handleProductSelect}
            />
          </section>
        )}

        {/* Floating Cart Button */}
        <CartFloatingButton 
          itemCount={cart.getTotalItems()}
          totalPrice={cart.getTotalPrice()}
          onCartClick={cart.openCart}
        />
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={(product, options) => {
            cart.addItem(product, 1, options);
            handleCloseModal();
          }}
        />
      )}
    </>
  );
}


