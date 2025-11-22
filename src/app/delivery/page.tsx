'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types/dotflow';
import { dotflowAPI } from '@/lib/dotflow-api';
import { useProductFilters } from '@/hooks/useProductFilters';
import { ProductFilterService } from '@/services/productFilterService';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';
import { RestaurantInfo } from '@/components/delivery/RestaurantInfo';
import { HighlightsSection } from '@/components/delivery/HighlightsSection';
import { CategoryTabs } from '@/components/delivery/CategoryTabs';
import { ProductGrid } from '@/components/delivery/ProductGrid';
import { CategorizedProductSections } from '@/components/delivery/CategorizedProductSections';
import { ProductModal } from '@/components/delivery/ProductModal';
import { CartFloatingButton } from '@/components/delivery/CartFloatingButton';
import { DesktopSidebar } from '@/components/delivery/DesktopSidebar';
import { SearchBar } from '@/components/delivery/SearchBar';
import { useCart } from '@/contexts/CartContext';

interface CustomerMetadata {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  preferences?: {
    favorite_categories?: string[];
    payment_method?: string;
  };
}

function DeliveryContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customerMetadata, setCustomerMetadata] = useState<CustomerMetadata | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
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
    loadCustomerFromParams();
  }, []);

  // Carregar dados do cliente via parâmetros da URL
  const loadCustomerFromParams = async () => {
    const token = searchParams.get('token');
    const ref = searchParams.get('ref'); // Para hash simples
    const customerId = searchParams.get('customer_id'); // ⚠️ NÃO RECOMENDADO - apenas para desenvolvimento
    
    // ⚠️ SEGURANÇA: Preferir sempre token ou ref ao invés de customer_id direto
    if (customerId && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ ATENÇÃO: Usando customer_id direto na URL. Isso não é seguro para produção!');
    }

    if (!token && !ref && !customerId) {
      return; // Sem parâmetros, não carregar dados
    }

    setLoadingCustomer(true);
    try {
      // Opção 1: Token (obrigatório) e ref (opcional)
      if (token) {
        const params = new URLSearchParams({ token });
        if (ref) {
          params.append('ref', ref);
        }
        
        const response = await fetch(`/api/customers/get-by-token?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.customer) {
            setCustomerMetadata({
              id: data.customer.id,
              name: data.customer.name,
              phone: data.customer.phone,
              email: data.customer.email,
              address: typeof data.customer.address === 'string' 
                ? JSON.parse(data.customer.address) 
                : data.customer.address,
              preferences: data.customer.preferences
            });
            
            // Pré-preencher dados no localStorage para uso no carrinho
            if (data.customer.phone) {
              // Remover sufixo do WhatsApp antes de salvar
              const cleanPhone = data.customer.phone.replace(/@s\.whatsapp\.net/gi, '');
              localStorage.setItem('delivery_customer_phone', cleanPhone);
            }
            if (data.customer.name) {
              localStorage.setItem('delivery_customer_name', data.customer.name);
            }
            if (data.customer.address) {
              const address = typeof data.customer.address === 'string' 
                ? JSON.parse(data.customer.address) 
                : data.customer.address;
              localStorage.setItem('delivery_customer_address', JSON.stringify(address));
            }
            
            // Salvar token para usar na criação do pedido
            if (token) {
              localStorage.setItem('delivery_customer_token', token);
            }
            if (ref) {
              localStorage.setItem('delivery_customer_ref', ref);
            }
            
            console.log('✅ Dados do cliente carregados via token:', data.customer.id);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('⚠️ Token inválido ou expirado:', errorData.error);
        }
      }
      
      // Opção 2: customer_id direto (APENAS DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO)
      else if (customerId && process.env.NODE_ENV === 'development') {
        const response = await fetch(`/api/customers/get-by-id?id=${customerId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.customer) {
            setCustomerMetadata({
              id: data.customer.id,
              name: data.customer.name,
              phone: data.customer.phone,
              email: data.customer.email,
              address: data.customer.address,
              preferences: data.customer.preferences
            });
            
            console.log('✅ Dados do cliente carregados (MODO DESENVOLVIMENTO)');
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do cliente:', error);
    } finally {
      setLoadingCustomer(false);
    }
  };

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
      
      {/* Banner de boas-vindas personalizado se cliente identificado */}
      {customerMetadata && customerMetadata.name && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            👋 Olá, <span className="font-bold">{customerMetadata.name}</span>! Bem-vindo ao nosso cardápio digital
          </p>
        </div>
      )}
      
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
          <div className="mb-6 lg:mb-8">
            <CategoryTabs 
              categories={pizzaCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setCategory}
            />
            
            {/* Dica para o usuário */}
            {selectedCategory !== 'all' && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  📋 Clique em "Seções" para ver todos os produtos organizados por categoria
                </p>
              </div>
            )}
          </div>

          {/* Products Display */}
          {selectedCategory === 'all' ? (
            <CategorizedProductSections 
              products={products}
              onProductSelect={handleProductSelect}
              searchTerm={searchTerm}
            />
          ) : (
            <>
              {/* Produtos da categoria selecionada */}
              <ProductGrid 
                products={filteredProducts}
                onProductSelect={handleProductSelect}
              />
              
              {/* Adicionais: mostrar apenas quando categoria clássica, especial ou doce está selecionada */}
              {(selectedCategory === 'classicas' || selectedCategory === 'especiais' || selectedCategory === 'doces') && (
                <div className="mt-8 lg:mt-12">
                  <div className="mb-4 lg:mb-6">
                    <div className="flex items-start gap-3 lg:gap-4 mb-3">
                      <span className="text-2xl lg:text-3xl flex-shrink-0">🧀</span>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg lg:text-xl font-bold text-white mb-1">
                          Adicionais
                        </h2>
                        <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                          Ingredientes extras para personalizar sua pizza
                        </p>
                      </div>
                    </div>
                  </div>
                  <ProductGrid 
                    products={ProductFilterService.filterProducts(products, { 
                      category: 'adicionais',
                      searchTerm: searchTerm.trim() || undefined
                    })}
                    onProductSelect={handleProductSelect}
                  />
                </div>
              )}
            </>
          )}
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

export default function DeliveryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <DeliveryContent />
    </Suspense>
  );
}
