'use client';

import { Product } from '@/types/dotflow';
import { Plus, Star } from 'lucide-react';

interface HighlightsSectionProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function HighlightsSection({ products, onProductSelect }: HighlightsSectionProps) {
  // Filtrar apenas pizzas (Clássicas, Especiais e Doces)
  const pizzas = products.filter(p => 
    p.active && 
    p.ammount_stock > 0 && 
    p.category_id && 
    [8, 9, 10].includes(p.category_id)
  );

  // Função para embaralhar array (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Selecionar 6 produtos aleatórios
  const highlightProducts = shuffleArray(pizzas).slice(0, 6);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getProductImage = (product: Product) => {
    // Usar link_product se disponível
    if (product.link_product) {
      return product.link_product;
    }
    
    const productName = product.name.toLowerCase();
    
    const imageMap: Record<string, string> = {
      'americana': '/americana.jpeg',
      'calabresa': '/calabresa.jpeg',
      'portuguesa': '/portuguesa.jpeg',
      'marguerita': '/marguerita.jpeg',
      'quatro queijos': '/4queijos.jpeg',
      'presunto': '/presunto.jpeg',
      'milho': '/milho.jpeg',
      'brócolis': '/brocolis-bacon.jpeg',
      'frango catupiry': '/frango-catupiry.jpeg',
      'frango cheddar': '/frango-cheddar.jpeg',
      'go pizza': '/gopizza.jpeg',
      'chocolate': '/choconinho.jpeg',
      'bis': '/bis.jpeg',
      'sensação': '/sensacao.jpeg'
    };
    
    for (const [key, value] of Object.entries(imageMap)) {
      if (productName.includes(key)) {
        return value;
      }
    }
    
    return '/pizza-brocolis-bacon-classica.jpeg';
  };

  const getCategoryBadge = (product: Product) => {
    // Badges baseados no category_id
    if (product.category_id === 9) return { text: 'Especial', color: 'bg-amber-500' };
    if (product.category_id === 10) return { text: 'Doce', color: 'bg-purple-500' };
    if (product.category_id === 14) return { text: 'Combo', color: 'bg-green-500' };
    if (product.price_offer && product.price_offer < product.price) {
      return { text: 'Promoção', color: 'bg-red-500' };
    }
    
    return null;
  };

  if (highlightProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {/* Título da Seção */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            ⭐ Destaques da Semana
          </h2>
          <p className="text-sm lg:text-base text-gray-400">
            Os produtos mais pedidos pelos nossos clientes
          </p>
        </div>
        
        {/* Grid de Produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {highlightProducts.map((product) => {
            const badge = getCategoryBadge(product);
            
            return (
              <div
                key={product.id}
                onClick={() => onProductSelect(product)}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
              >
                {/* Imagem do produto */}
                <div className="relative h-36 lg:h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/pizza-brocolis-bacon-classica.jpeg';
                    }}
                  />
                  
                  {/* Badge de categoria */}
                  {badge && (
                    <div className={`absolute top-2 left-2 ${badge.color} text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md`}>
                      {badge.text}
                    </div>
                  )}

                  {/* Botão de adicionar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductSelect(product);
                    }}
                    className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Informações do produto */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem] leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Descrição */}
                  {product.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Avaliação */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">4.2</span>
                  </div>
                  
                  {/* Preço */}
                  <div className="flex items-center justify-between">
                    {product.price_offer && product.price_offer < product.price ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-red-600 dark:text-red-400 text-base">
                          {formatPrice(product.price_offer)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
