'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product, Category } from '@/types/dotflow';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Tv, 
  Camera, 
  Gamepad2, 
  Watch, 
  Tablet,
  Monitor,
  Printer,
  Speaker,
  Keyboard,
  Sparkles,
  TrendingUp,
  Zap,
  Search,
  Filter,
  Grid,
  List,
  Package
} from 'lucide-react';

interface CategoryDisplay {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  productCount: number;
  color: string;
  gradient: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carregar produtos da API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar produtos e categorias da API
        const [productsData, categoriesData] = await Promise.all([
          dotflowAPI.getProducts(),
          dotflowAPI.getCategories()
        ]);
        
        const apiProducts = productsData.products || [];
        const apiCategories = categoriesData.categories || [];
        
        if (apiProducts.length > 0) {
          setProducts(apiProducts);
          console.log('✅ Produtos carregados da API DotFlow para categorias');
          console.log(`📦 Total: ${apiProducts.length} produtos`);
        } else {
          throw new Error('Nenhum produto encontrado na API');
        }
        
        if (apiCategories.length > 0) {
          setCategories(apiCategories);
          console.log('✅ Categorias carregadas da API DotFlow');
          console.log(`📂 Total: ${apiCategories.length} categorias`);
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
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Função para transformar categorias da API em categorias de exibição
  const getCategoryDisplay = (category: Category): CategoryDisplay => {
    const icons = [Package, Smartphone, Laptop, Headphones, Tv, Camera, Gamepad2, Watch, Tablet, Monitor, Printer, Speaker, Keyboard];
    const gradients = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-red-500 to-red-600',
      'bg-gradient-to-r from-yellow-500 to-yellow-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-teal-500 to-teal-600',
      'bg-gradient-to-r from-gray-500 to-gray-600',
      'bg-gradient-to-r from-emerald-500 to-emerald-600',
      'bg-gradient-to-r from-cyan-500 to-cyan-600'
    ];
    
    const IconComponent = icons[category.id % icons.length];
    const gradient = gradients[category.id % gradients.length];
    
    return {
      id: category.id.toString(),
      name: category.name,
      description: category.description || `Produtos da categoria ${category.name}`,
      icon: <IconComponent className="w-8 h-8" />,
      productCount: products.filter(p => p.category_id === category.id).length,
      color: gradient.replace('bg-gradient-to-r ', ''),
      gradient: gradient
    };
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(getCategoryDisplay);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
              Carregando categorias...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-700 dark:via-purple-700 dark:to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Categorias
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore nossa ampla variedade de produtos organizados por categoria
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Encontre exatamente o que você procura de forma rápida e fácil
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Busca */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-4">
              {/* Filtro */}
              <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Filtros</span>
              </button>

              {/* Modo de Visualização */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">{error}</span>
            </div>
          </div>
        )}

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                console.log('🔄 Redirecionando para categoria:', category.id);
                router.push(`/categories/${category.id}`);
              }}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105"
            >
              {/* Header da Categoria */}
              <div className={`${category.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.productCount} produtos</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {category.description}
                </p>
                
                {/* Botão Explorar */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Explorar categoria
                  </span>
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Destaques */}
        <div className="mt-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Categorias em Destaque
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-400 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category) => {
              const categoryDisplay = getCategoryDisplay(category);
              return (
                <div
                  key={`featured-${category.id}`}
                  onClick={() => {
                    console.log('🔄 Redirecionando para categoria em destaque:', category.id);
                    router.push(`/categories/${category.id}`);
                  }}
                  className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200 dark:border-gray-700"
                >
                  <div className={`${categoryDisplay.gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                          {categoryDisplay.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{categoryDisplay.name}</h3>
                          <p className="text-sm opacity-90">{categoryDisplay.productCount} produtos</p>
                        </div>
                      </div>
                      <p className="text-sm opacity-90 mb-6 leading-relaxed">
                        {categoryDisplay.description}
                      </p>
                      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 group-hover:scale-105">
                        Ver produtos
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Nossas Categorias em Números
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {categories.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Categorias</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {categories.reduce((acc, cat) => acc + getCategoryDisplay(cat).productCount, 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  24/7
                </div>
                <div className="text-gray-600 dark:text-gray-400">Suporte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  100%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Garantia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 