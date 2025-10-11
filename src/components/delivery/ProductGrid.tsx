'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    // Mapear produtos para imagens baseado no nome
    const productName = product.name.toLowerCase();
    
    if (productName.includes('margherita')) return '/marguerita.jpeg';
    if (productName.includes('gopizza')) return '/gopizza.jpeg';
    if (productName.includes('peperoni')) return '/peperoni.jpeg';
    if (productName.includes('portuguesa')) return '/portuguesa.jpeg';
    if (productName.includes('calabresa')) return '/calabresa.jpeg';
    if (productName.includes('chocolate')) return '/choconinho.jpeg';
    if (productName.includes('morango')) return '/morango.jpeg';
    if (productName.includes('pepperoni')) return '/frango-catupiry.jpeg';
    if (productName.includes('frango') && productName.includes('catupiry')) return '/frango-catupiry.jpeg';
    if (productName.includes('frango') && productName.includes('cheddar')) return '/frango-cheddar.jpeg';
    if (productName.includes('brocolis') && productName.includes('bacon')) return '/brocolis-bacon.jpeg';
    if (productName.includes('milho')) return '/milho.jpeg';
    if (productName.includes('4 queijos') || productName.includes('quatro queijos')) return '/4queijos.jpeg';
    if (productName.includes('americana')) return '/americana.jpeg';
    if (productName.includes('bis')) return '/bis.jpeg';
    if (productName.includes('presunto')) return '/presunto.jpeg';
    if (productName.includes('sensacao')) return '/sensacao.jpeg';
    
    return '/pizza-brocolis-bacon-classica.jpeg'; // Imagem padrão
  };


  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍕</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Nenhuma pizza encontrada
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tente selecionar uma categoria diferente
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductSelect(product)}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Imagem do Produto */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Botão de Favoritar */}
            <button
              onClick={(e) => toggleFavorite(product.id, e)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                favorites.has(product.id)
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${
                  favorites.has(product.id) ? 'fill-current' : ''
                }`} 
              />
            </button>

            {/* Badge de Promoção */}
            {product.price_offer && product.price_offer < product.price && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{Math.round(((product.price - product.price_offer) / product.price) * 100)}%
              </div>
            )}
          </div>

          {/* Conteúdo do Card */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {product.name}
              </h3>
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Avaliação */}
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                (4.2)
              </span>
            </div>

            {/* Preço e Botão */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.price_offer && product.price_offer < product.price ? (
                  <>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatPrice(product.price_offer)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProductSelect(product);
                }}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

