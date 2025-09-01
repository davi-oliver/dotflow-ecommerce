'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/dotflow';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  Eye,
  Plus,
  Check
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const router = useRouter();
  const cart = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  const renderDiscountBadge = () => {
    // Verificação mais robusta para desconto
    if (!product.price_offer || product.price_offer <= 0) {
      return null; // Não renderiza nada se não há desconto
    }
    
    if (product.price_offer >= product.price) {
      return null; // Não renderiza se o preço com desconto é maior ou igual ao original
    }
    
    const discountPercentage = getDiscountPercentage(product.price, product.price_offer);
    
    if (discountPercentage <= 0) {
      return null; // Não renderiza se o desconto é 0% ou negativo
    }
    
    return (
      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
        -{discountPercentage}%
      </div>
    );
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      cart.addToCart(product, 1);
      // Feedback visual
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      setIsAddingToCart(false);
    }
  };

  const handleViewProduct = () => {
    router.push(`/products/${product.id}`);
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden ${isCompact ? 'hover:scale-105' : ''}`}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <div className={`bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center ${isCompact ? 'h-32' : 'h-48'}`}>
          <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center ${isCompact ? 'w-16 h-16' : 'w-24 h-24'}`}>
            <Package className={`text-white ${isCompact ? 'w-8 h-8' : 'w-12 h-12'}`} />
          </div>
        </div>

        {/* Discount Badge */}
        {renderDiscountBadge()}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleViewProduct}
            className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Status */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.ammount_stock > 0
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
            {product.ammount_stock > 0 ? `${product.ammount_stock} em estoque` : 'Sem estoque'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-4 ${isCompact ? 'p-3' : ''}`}>
        {/* Product Name */}
        <h3
          onClick={handleViewProduct}
          className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 ${isCompact ? 'text-sm' : 'text-lg'
            }`}
        >
          {product.name}
        </h3>

        {/* Description */}
        {!isCompact && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          {product.price_offer && product.price_offer > 0 && product.price_offer < product.price ? (
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-gray-900 dark:text-gray-100 ${isCompact ? 'text-base' : 'text-xl'}`}>
                {formatPrice(product.price_offer)}
              </span>
              <span className={`text-gray-500 dark:text-gray-400 line-through ${isCompact ? 'text-sm' : 'text-base'}`}>
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className={`font-bold text-gray-900 dark:text-gray-100 ${isCompact ? 'text-base' : 'text-xl'}`}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        {!isCompact && (
          <div className="flex items-center space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.5)</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={product.ammount_stock === 0 || isAddingToCart}
            className={`flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${isCompact ? 'text-sm py-1.5' : ''
              }`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{isCompact ? 'Adicionar' : 'Adicionar ao Carrinho'}</span>
              </>
            )}
          </button>

          {!isCompact && (
            <button
              onClick={handleViewProduct}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* SKU */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          SKU: {product.sku}
        </div>
      </div>
    </div>
  );
} 