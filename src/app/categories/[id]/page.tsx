'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product, Category } from '@/types/dotflow';
import { ProductCard } from '@/components/ProductCard';
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
  Filter,
  Grid,
  List,
  ChevronDown,
  Package,
  ArrowLeft
} from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      try {
        // Buscar categoria e produtos da API
        const [categoriesData, productsData] = await Promise.all([
          dotflowAPI.getCategories(),
          dotflowAPI.getProducts()
        ]);
        
        const foundCategory = categoriesData.categories.find(cat => cat.id.toString() === categoryId);
        if (!foundCategory) {
          setError('Categoria não encontrada');
          setLoading(false);
          return;
        }
        
        setCategory(foundCategory);
        
        // Filtrar produtos da categoria
        const categoryProducts = productsData.products.filter(product => 
          product.category_id === foundCategory.id
        );
        setProducts(categoryProducts);
        
        console.log('✅ Categoria carregada:', foundCategory.name);
        console.log(`📦 Produtos encontrados: ${categoryProducts.length}`);
        
      } catch (err) {
        console.warn('⚠️ Erro ao carregar dados da API:', err);
        setError('Erro ao carregar dados da categoria');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategoryData();
    }
  }, [categoryId]);

  // Função para obter ícone e cor da categoria
  const getCategoryDisplay = (category: Category) => {
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
      icon: <IconComponent className="w-6 h-6" />,
      gradient: gradient
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando categoria...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoria não encontrada</h1>
          <button
            onClick={() => router.push('/categories')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Categorias
          </button>
        </div>
      </div>
    );
  }

  const categoryDisplay = getCategoryDisplay(category);

  return (
    <>
      {/* Header da Categoria */}
      <div className={`${categoryDisplay.gradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              {categoryDisplay.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-lg opacity-90">{products.length} produtos encontrados</p>
            </div>
          </div>
          <p className="text-lg opacity-90 max-w-2xl">
            {category.description || `Produtos da categoria ${category.name}`}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="hover:text-blue-600 transition-colors"
            >
              Início
            </button>
            <span>/</span>
            <button
              onClick={() => router.push('/categories')}
              className="hover:text-blue-600 transition-colors"
            >
              Categorias
            </button>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Não encontramos produtos nesta categoria no momento.
            </p>
            <button
              onClick={() => router.push('/categories')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Outras Categorias
            </button>
          </div>
        )}
      </div>
    </>
  );
} 