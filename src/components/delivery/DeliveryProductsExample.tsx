'use client';

import { useEffect, useState } from 'react';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product } from '@/types/dotflow';
import { ProductGrid } from './ProductGrid';

interface DeliveryProductsExampleProps {
  onProductSelect: (product: Product) => void;
}

export function DeliveryProductsExample({ onProductSelect }: DeliveryProductsExampleProps) {
  const [mainProducts, setMainProducts] = useState<Product[]>([]);
  const [complements, setComplements] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Carregando produtos do delivery...');

        // Carrega produtos principais e complementos em paralelo
        const [mainResponse, complementsResponse] = await Promise.all([
          dotflowAPI.getDeliveryMainProducts(),
          dotflowAPI.getDeliveryComplements()
        ]);

        console.log('✅ Produtos principais carregados:', mainResponse.products.length);
        console.log('✅ Complementos carregados:', complementsResponse.products.length);

        setMainProducts(mainResponse.products);
        setComplements(complementsResponse.products);
      } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        setError('Erro ao carregar produtos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😞</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Erro ao carregar produtos
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Produtos Principais */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-red-600 rounded"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Produtos Principais
          </h2>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {mainProducts.length} produtos
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Pizzas, bebidas, sobremesas e promoções (Categorias: 1, 2, 3, 7, 8)
        </p>
        <ProductGrid products={mainProducts} onProductSelect={onProductSelect} />
      </section>

      {/* Complementos */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complementos
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {complements.length} produtos
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Bordas, adicionais e acompanhamentos (Categorias: 4, 5, 6)
        </p>
        <ProductGrid products={complements} onProductSelect={onProductSelect} />
      </section>

      {/* Resumo */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Resumo dos Produtos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Produtos Principais:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{mainProducts.length} itens</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Complementos:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{complements.length} itens</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {mainProducts.length + complements.length} produtos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


