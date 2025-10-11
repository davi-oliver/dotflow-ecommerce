'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types/dotflow';
import { dotflowAPI } from '@/lib/dotflow-api';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';
import { CategoryTabs } from '@/components/delivery/CategoryTabs';
import { ProductGrid } from '@/components/delivery/ProductGrid';
import { ProductModal } from '@/components/delivery/ProductModal';
import { CartFloatingButton } from '@/components/delivery/CartFloatingButton';
import { useCart } from '@/contexts/CartContext';

export default function DeliveryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cart = useCart();

  // Categorias específicas para pizzaria
  const pizzaCategories = [
    { id: 'all', name: 'Todas', icon: '🍕' },
    { id: 'classicas', name: 'Clássicas', icon: '🍕' },
    { id: 'doces', name: 'Doces', icon: '🍰' },
    { id: 'especiais', name: 'Especiais', icon: '⭐' },
  ];

  useEffect(() => {
    loadData();
  }, []);

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

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    
    // Mapear categorias baseado no nome do produto
    const productName = product.name.toLowerCase();
    
    switch (selectedCategory) {
      case 'classicas':
        return productName.includes('margherita') || 
               productName.includes('pepperoni') || 
               productName.includes('portuguesa') ||
               productName.includes('calabresa') ||
               productName.includes('napolitana');
      case 'doces':
        return productName.includes('chocolate') || 
               productName.includes('morango') || 
               productName.includes('banana') ||
               productName.includes('doce');
      case 'especiais':
        return productName.includes('especial') || 
               productName.includes('premium') || 
               productName.includes('gourmet') ||
               productName.includes('artesanal');
      default:
        return true;
    }
  });

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
        </div>

        {/* Category Tabs */}
        <CategoryTabs 
          categories={pizzaCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Products Grid */}
        <ProductGrid 
          products={filteredProducts}
          onProductSelect={handleProductSelect}
        />

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
