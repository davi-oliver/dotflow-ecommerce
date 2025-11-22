'use client';

import { useState, useEffect } from 'react';
import { DemoBanner } from '@/components/DemoBanner';
import { ProductCard } from '@/components/ProductCard';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product } from '@/types/dotflow';
import { Star, TrendingUp, Flame, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando produtos da API DotFlow...');
      
      // Tentar carregar da API
      const data = await dotflowAPI.getProducts();
      console.log('📦 Dados brutos da API:', data);
      console.log('📦 Tipo de dados:', typeof data);
      console.log('📦 Chaves disponíveis:', Object.keys(data));
      
      const apiProducts = data.products || [];
      console.log('📦 Produtos da API:', apiProducts);
      console.log('📦 Tipo de produtos:', typeof apiProducts);
      console.log('📦 É array?', Array.isArray(apiProducts));
      
              if (apiProducts.length > 0) {
          console.log('✅ Produtos encontrados na API:', apiProducts.length);
          console.log('📦 Primeiro produto:', apiProducts[0]);
          console.log('📦 Estrutura do primeiro produto:', Object.keys(apiProducts[0]));
          
          // Verificar se os produtos têm as propriedades necessárias
          const validProducts = apiProducts.filter((product: Product) => 
            product.id && product.name && typeof product.price === 'number'
          );
          console.log('📦 Produtos válidos:', validProducts.length);
          
          if (validProducts.length === 0) {
            console.error('❌ Nenhum produto válido encontrado');
            console.error('❌ Produtos inválidos:', apiProducts);
            throw new Error('Nenhum produto válido encontrado');
          }
          
          // Simplesmente usar todos os produtos da API
          setProducts(validProducts);
          
          // Produtos em Destaque (primeiros 6 produtos)
          setFeaturedProducts(validProducts.slice(0, 6));
          
          // Mais Vendidos (próximos 8 produtos)
          setBestSellers(validProducts.slice(6, 14));
          
          console.log('✅ Produtos carregados da API DotFlow');
          console.log(`📦 Total: ${validProducts.length} produtos`);
          console.log(`⭐ Destaque: ${Math.min(validProducts.length, 6)} produtos`);
          console.log(`🔥 Mais Vendidos: ${Math.min(Math.max(validProducts.length - 6, 0), 8)} produtos`);
          console.log('🎨 Produtos para renderizar:', validProducts);
          
          // Forçar re-render 
          setTimeout(() => {
            console.log('🔄 Forçando re-render...');
            setProducts([...validProducts]);
          }, 100);
        } else {
          console.log('⚠️ Nenhum produto encontrado na API, usando dados de exemplo');
          throw new Error('Nenhum produto encontrado na API');
        }
      
    } catch (err) {
      console.warn('⚠️ API DotFlow não disponível, usando dados de exemplo:', err);
      setError('API não disponível - usando dados de demonstração');
      
      // Dados de exemplo para desenvolvimento
      const sampleProducts = [
        {
          id: 1,
          name: "Smartphone Galaxy S23",
          description: "O mais recente smartphone Samsung com câmera de 108MP e processador Snapdragon 8 Gen 2",
          sku: "SAMS23-001",
          price: 4999.99,
          price_offer: 4499.99,
          ammount_stock: 15,
          active: true,
          corporate_id: 1,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          name: "Notebook Dell Inspiron 15",
          description: "Notebook ideal para trabalho e estudos com Intel Core i7 e 16GB RAM",
          sku: "DELL-INS-001",
          price: 3499.99,
          ammount_stock: 8,
          active: true,
          corporate_id: 1,
          created_at: "2024-01-14T10:00:00Z",
          updated_at: "2024-01-14T10:00:00Z"
        },
        {
          id: 3,
          name: "Fone de Ouvido Bluetooth Sony",
          description: "Fone sem fio com cancelamento de ruído ativo e bateria de 30h",
          sku: "BT-HEAD-001",
          price: 299.99,
          price_offer: 249.99,
          ammount_stock: 25,
          active: true,
          corporate_id: 1,
          created_at: "2024-01-13T10:00:00Z",
          updated_at: "2024-01-13T10:00:00Z"
        }
      ];
      
      setProducts(sampleProducts);
      setFeaturedProducts(sampleProducts.filter(p => p.price_offer));
      setBestSellers(sampleProducts);
      console.log('🔄 Usando dados de exemplo:', sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos da API
  useEffect(() => {
    loadProducts();
  }, []);

  const FeaturedProductCard = ({ product }: { product: Product }) => (
    <ProductCard product={product} variant="compact" />
  );

  return (
    <>
      {/* Demo Banner */}
      <DemoBanner isVisible={!!error} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-700 dark:via-purple-700 dark:to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              DotFlow E-commerce
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Descubra produtos incríveis com os melhores preços e qualidade garantida
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl">
                Ver Produtos
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Ofertas Especiais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Carregando produtos...
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Produtos em Destaque */}
            {featuredProducts.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Produtos em Destaque</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-400 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {featuredProducts.map((product) => (
                    <FeaturedProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Mais Vendidos */}
            {bestSellers.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mais Vendidos</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-400 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Todos os Produtos */}
            <section>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Todos os Produtos</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-400 to-transparent"></div>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {products.length} produtos
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
