'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product } from '@/types/dotflow';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Star,
  Heart,
  ShoppingCart,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Tag,
  Package,
  Clock,
  ArrowRight,
  FilterX,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onSale: boolean;
  sortBy: 'name' | 'price' | 'price_desc' | 'newest' | 'popular';
  category: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    onSale: false,
    sortBy: 'newest',
    category: ''
  });

  // Carregar produtos da API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Tentar carregar da API
        const data = await dotflowAPI.getProducts();
        const apiProducts = data.products || [];
        
        if (apiProducts.length > 0) {
          setProducts(apiProducts);
          console.log('✅ Produtos carregados da API DotFlow para busca');
          console.log(`📦 Total: ${apiProducts.length} produtos`);
        } else {
          throw new Error('Nenhum produto encontrado na API');
        }
        
      } catch (err) {
        console.warn('⚠️ API DotFlow não disponível, usando dados de exemplo:', err);
        setError('API não disponível - usando dados de demonstração');
        
        // Dados de exemplo para desenvolvimento
        const sampleProducts: Product[] = [
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
            name: "iPhone 15 Pro",
            description: "iPhone com chip A17 Pro e câmera tripla de 48MP",
            sku: "IPH15-001",
            price: 8999.99,
            ammount_stock: 8,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-14T10:00:00Z",
            updated_at: "2024-01-14T10:00:00Z"
          },
          {
            id: 3,
            name: "Notebook Dell Inspiron 15",
            description: "Notebook ideal para trabalho e estudos com Intel Core i7",
            sku: "DELL-INS-001",
            price: 3499.99,
            ammount_stock: 8,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-14T10:00:00Z",
            updated_at: "2024-01-14T10:00:00Z"
          },
          {
            id: 4,
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
          },
          {
            id: 5,
            name: "Smart TV Samsung 55\" 4K",
            description: "Smart TV com resolução 4K, HDR e sistema Tizen",
            sku: "TV-SAMS-001",
            price: 2799.99,
            price_offer: 2399.99,
            ammount_stock: 12,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-12T10:00:00Z",
            updated_at: "2024-01-12T10:00:00Z"
          },
          {
            id: 6,
            name: "Câmera DSLR Canon EOS R",
            description: "Câmera mirrorless profissional com sensor full-frame",
            sku: "CAM-CAN-001",
            price: 8999.99,
            ammount_stock: 5,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-11T10:00:00Z",
            updated_at: "2024-01-11T10:00:00Z"
          }
        ];
        
        setProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Gerar categorias dinamicamente
  const categories: Category[] = [
    { id: 'smartphones', name: 'Smartphones', count: products.filter(p => p.name.toLowerCase().includes('smartphone') || p.name.toLowerCase().includes('iphone')).length },
    { id: 'notebooks', name: 'Notebooks', count: products.filter(p => p.name.toLowerCase().includes('notebook') || p.name.toLowerCase().includes('dell')).length },
    { id: 'headphones', name: 'Fones de Ouvido', count: products.filter(p => p.name.toLowerCase().includes('fone') || p.name.toLowerCase().includes('bluetooth')).length },
    { id: 'tvs', name: 'Smart TVs', count: products.filter(p => p.name.toLowerCase().includes('tv')).length },
    { id: 'cameras', name: 'Câmeras', count: products.filter(p => p.name.toLowerCase().includes('câmera') || p.name.toLowerCase().includes('canon')).length }
  ].filter(cat => cat.count > 0);

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filters.category) {
      filtered = filtered.filter(product => {
        const productName = product.name.toLowerCase();
        switch (filters.category) {
          case 'smartphones':
            return productName.includes('smartphone') || productName.includes('iphone');
          case 'notebooks':
            return productName.includes('notebook') || productName.includes('dell');
          case 'headphones':
            return productName.includes('fone') || productName.includes('bluetooth');
          case 'tvs':
            return productName.includes('tv');
          case 'cameras':
            return productName.includes('câmera') || productName.includes('canon');
          default:
            return true;
        }
      });
    }

    // Filtro por preço mínimo
    if (filters.minPrice > 0) {
      filtered = filtered.filter(product => 
        (product.price_offer || product.price) >= filters.minPrice
      );
    }

    // Filtro por preço máximo
    if (filters.maxPrice < 10000) {
      filtered = filtered.filter(product => 
        (product.price_offer || product.price) <= filters.maxPrice
      );
    }

    // Filtro por estoque
    if (filters.inStock) {
      filtered = filtered.filter(product => product.ammount_stock > 0);
    }

    // Filtro por promoção
    if (filters.onSale) {
      filtered = filtered.filter(product => product.price_offer && product.price_offer < product.price);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price_offer || a.price) - (b.price_offer || b.price);
        case 'price_desc':
          return (b.price_offer || b.price) - (a.price_offer || a.price);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular':
          return b.ammount_stock - a.ammount_stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adicionar ao carrinho:', product);
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Adicionar aos favoritos:', product);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000,
      inStock: false,
      onSale: false,
      sortBy: 'newest',
      category: ''
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Carregando produtos...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 dark:from-purple-700 dark:via-blue-700 dark:to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Buscar Produtos
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Encontre exatamente o que você procura em nossa loja
            </p>
            
            {/* Formulário de Busca */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o que você está procurando..."
                  className="w-full pl-12 pr-32 py-4 border-0 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 text-lg bg-white bg-opacity-90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Termo de busca atual */}
            {searchTerm && (
              <div className="mt-6 flex items-center justify-center space-x-3">
                                 <span className="text-purple-200">
                   Resultados para: <span className="font-semibold text-white">&quot;{searchTerm}&quot;</span>
                 </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    router.push('/search');
                  }}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Laterais */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center text-lg">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filtros
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center"
                >
                  <FilterX className="w-4 h-4 mr-1" />
                  Limpar
                </button>
              </div>

              {/* Categorias */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Categorias
                </h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={filters.category === category.id}
                          onChange={(e) => setFilters({...filters, category: e.target.value})}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Faixa de Preço
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Preço mínimo</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Preço máximo</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Ordenação */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <SortAsc className="w-4 h-4 mr-2" />
                  Ordenar por
                </h4>
                                 <select
                   value={filters.sortBy}
                   onChange={(e) => setFilters({...filters, sortBy: e.target.value as FilterOptions['sortBy']})}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                 >
                  <option value="newest">Mais recentes</option>
                  <option value="name">Nome A-Z</option>
                  <option value="price">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="popular">Mais populares</option>
                </select>
              </div>

              {/* Filtros de Disponibilidade */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Disponibilidade
                </h4>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Apenas em estoque</span>
                </label>
                
                <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => setFilters({...filters, onSale: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Apenas em promoção</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="flex-1">
            {/* Controles de Resultados */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Estatísticas */}
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredProducts.length}</span> produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                                         {searchTerm && (
                       <span className="text-blue-600 dark:text-blue-400"> para &quot;{searchTerm}&quot;</span>
                     )}
                  </p>
                  {filters.category && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {categories.find(c => c.id === filters.category)?.name}
                    </span>
                  )}
                </div>

                {/* Controles de Visualização */}
                <div className="flex items-center space-x-4">
                  {/* Modo de Visualização */}
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant={viewMode === 'list' ? 'default' : 'default'} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 dark:text-gray-500 mb-6">
                  <Search className="w-20 h-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? `Não encontramos produtos para "${searchTerm}". Tente outros termos ou ajuste os filtros.`
                    : 'Digite um termo de busca para encontrar produtos ou explore nossas categorias.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        router.push('/search');
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Limpar Busca
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/categories')}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Ver Categorias
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 