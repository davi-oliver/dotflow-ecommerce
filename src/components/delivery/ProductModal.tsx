'use client';

import { useState } from 'react';
import { Product } from '@/types/dotflow';
import { X, Plus, Minus, Heart, Star } from 'lucide-react';

interface ProductOptions {
  flavors: string[];
  size: string;
  border: string;
  extras: string[];
  quantity: number;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, options: ProductOptions) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState('grande');
  const [selectedBorder, setSelectedBorder] = useState('tradicional');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sabores disponíveis (simulados baseados no produto)
  const availableFlavors = [
    'Margherita', 'Pepperoni', 'Portuguesa', 'Calabresa', 'Napolitana',
    'Frango com Catupiry', 'Frango com Cheddar', 'Brócolis com Bacon',
    'Chocolate', 'Morango', 'Banana', 'Prestígio'
  ];

  // Tamanhos disponíveis
  const sizes = [
    { id: 'pequena', name: 'Pequena', price: 0 },
    { id: 'media', name: 'Média', price: 5 },
    { id: 'grande', name: 'Grande', price: 10 },
    { id: 'familia', name: 'Família', price: 15 }
  ];

  // Bordas disponíveis
  const borders = [
    { id: 'tradicional', name: 'Tradicional', price: 0 },
    { id: 'catupiry', name: 'Catupiry', price: 3 },
    { id: 'cheddar', name: 'Cheddar', price: 3 },
    { id: 'chocolate', name: 'Chocolate', price: 4 }
  ];

  // Adicionais disponíveis
  const extras = [
    { id: 'bacon', name: 'Bacon', price: 2 },
    { id: 'cebola', name: 'Cebola', price: 1 },
    { id: 'azeitona', name: 'Azeitona', price: 1.5 },
    { id: 'tomate', name: 'Tomate', price: 1 },
    { id: 'oregano', name: 'Orégano', price: 0.5 },
    { id: 'pimenta', name: 'Pimenta', price: 1 }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateTotalPrice = () => {
    const basePrice = product.price_offer || product.price;
    const sizePrice = sizes.find(s => s.id === selectedSize)?.price || 0;
    const borderPrice = borders.find(b => b.id === selectedBorder)?.price || 0;
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = extras.find(e => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);

    return (basePrice + sizePrice + borderPrice + extrasPrice) * quantity;
  };

  const handleFlavorToggle = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleExtraToggle = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter(e => e !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const handleAddToCart = () => {
    const options: ProductOptions = {
      flavors: selectedFlavors,
      size: selectedSize,
      border: selectedBorder,
      extras: selectedExtras,
      quantity
    };
    onAddToCart(product, options);
  };

  const getProductImage = (product: Product) => {
    const productName = product.name.toLowerCase();
    
    if (productName.includes('margherita')) return '/pizza-brocolis-bacon-classica.jpeg';
    if (productName.includes('pepperoni')) return '/frango-catupiry.jpeg';
    if (productName.includes('portuguesa')) return '/frango-cheddar.jpeg';
    if (productName.includes('calabresa')) return '/brocolis-bacon.jpeg';
    if (productName.includes('chocolate')) return '/milho.jpeg';
    if (productName.includes('morango')) return '/pizza-brocolis-bacon-classica.jpeg';
    
    return '/pizza-brocolis-bacon-classica.jpeg';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-600 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-6">
          {/* Título e Avaliação */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-gray-500 dark:text-gray-400">(4.2)</span>
            </div>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Seleção de Sabores */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Escolha até 2 sabores
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availableFlavors.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => handleFlavorToggle(flavor)}
                  disabled={!selectedFlavors.includes(flavor) && selectedFlavors.length >= 2}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedFlavors.includes(flavor)
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Tamanho */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tamanho
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedSize === size.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{size.name}</div>
                  {size.price > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      +{formatPrice(size.price)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Borda */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Borda
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {borders.map((border) => (
                <button
                  key={border.id}
                  onClick={() => setSelectedBorder(border.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedBorder === border.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{border.name}</div>
                  {border.price > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      +{formatPrice(border.price)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Adicionais */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Adicionais
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {extras.map((extra) => (
                <button
                  key={extra.id}
                  onClick={() => handleExtraToggle(extra.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedExtras.includes(extra.id)
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{extra.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    +{formatPrice(extra.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade e Preço */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Quantidade:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatPrice(calculateTotalPrice())}
              </div>
            </div>
          </div>

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

