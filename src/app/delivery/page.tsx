'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types/dotflow';
import { dotflowAPI } from '@/lib/dotflow-api';
import { useProductFilters } from '@/hooks/useProductFilters';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';
import { RestaurantInfo } from '@/components/delivery/RestaurantInfo';
import { HighlightsSection } from '@/components/delivery/HighlightsSection';
import { CategoryTabs } from '@/components/delivery/CategoryTabs';
import { ProductGrid } from '@/components/delivery/ProductGrid';
import { ProductModal } from '@/components/delivery/ProductModal';
import { CartFloatingButton } from '@/components/delivery/CartFloatingButton';
import { DesktopSidebar } from '@/components/delivery/DesktopSidebar';
import { SearchBar } from '@/components/delivery/SearchBar';
import { useCart } from '@/contexts/CartContext';

export default function DeliveryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cart = useCart();

  // Hook personalizado para filtragem
  const {
    selectedCategory,
    searchTerm,
    categories: pizzaCategories,
    filteredProducts,
    setCategory,
    setSearchTerm,
  } = useProductFilters(products);

  useEffect(() => {
    loadData();
  }, []);

  // Verificar se deve continuar checkout após login
  useEffect(() => {
    const shouldContinueCheckout = localStorage.getItem('dotflow-continue-checkout');
    if (shouldContinueCheckout === 'true' && cart.getTotalItems() > 0) {
      // Remover flag
      localStorage.removeItem('dotflow-continue-checkout');
      
      // Pequeno delay para garantir que o carrinho foi restaurado
      setTimeout(() => {
        console.log('🔄 Continuando checkout após login...');
        cart.openCart();
        
        // Auto-iniciar checkout (aguardar mais um pouco)
        setTimeout(() => {
          // O usuário pode revisar o carrinho antes de finalizar
          // Se quiser auto-finalizar, descomente a linha abaixo:
          // document.querySelector('[data-checkout-button]')?.click();
        }, 1000);
      }, 500);
    }
  }, [cart]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        dotflowAPI.getProducts(),
        dotflowAPI.getCategories()
      ]);

      setProducts(productsResponse.products);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <DesktopSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <DeliveryHeader onMenuClick={() => setSidebarOpen(true)} />
      <RestaurantInfo />
      <HighlightsSection 
        products={products}
        onProductSelect={handleProductSelect}
      />
      
      <main className="bg-gray-900 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          {/* Search Bar */}
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Category Tabs */}
          <CategoryTabs 
            categories={pizzaCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setCategory}
          />

          {/* Products Grid */}
          <ProductGrid 
            products={filteredProducts}
            onProductSelect={handleProductSelect}
          />
        </div>

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
