'use client';

import { useState } from 'react';
import { Product } from '@/types/dotflow';
import { Heart, Star, Plus } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (productId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

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
      const discount = Math.round(((product.price - product.price_offer) / product.price) * 100);
      return { text: `-${discount}%`, color: 'bg-red-500' };
    }
    
    return null;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16 lg:py-24">
        <div className="text-6xl lg:text-8xl mb-4">🍕</div>
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-400 text-sm lg:text-base">
          Tente selecionar outra categoria ou ajustar sua busca
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product) => {
        const badge = getCategoryBadge(product);
        const isFavorite = favorites.has(product.id);
        
        return (
          <div
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
          >
            {/* Imagem do Produto */}
            <div className="relative h-44 lg:h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/pizza-brocolis-bacon-classica.jpeg';
                }}
              />
              
              {/* Botão de Favoritar */}
              <button
                onClick={(e) => toggleFavorite(product.id, e)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-lg ${
                  isFavorite
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                />
              </button>

              {/* Badge */}
              {badge && (
                <div className={`absolute top-3 left-3 ${badge.color} text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md`}>
                  {badge.text}
                </div>
              )}

              {/* Botão de Adicionar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProductSelect(product);
                }}
                className="absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4">
              {/* Nome do Produto */}
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {product.name}
              </h3>

              {/* Descrição */}
              {product.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 min-h-[2rem] leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Avaliação */}
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">4.2</span>
              </div>

              {/* Preço */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  {product.price_offer && product.price_offer < product.price ? (
                    <>
                      <span className="text-xl font-bold text-red-600 dark:text-red-400">
                        {formatPrice(product.price_offer)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Indicador de estoque baixo */}
                {product.ammount_stock < 10 && product.ammount_stock > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Últimas unidades!
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
