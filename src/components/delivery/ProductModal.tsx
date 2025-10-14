'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/dotflow';
import { X, Plus, Minus, Heart, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { dotflowAPI } from '@/lib/dotflow-api';

interface ProductOptions {
  size: 'P' | 'M' | 'G';  // Tamanho da pizza
  flavors: Product[];
  border?: Product;
  extras: Product[];
  quantity: number;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, options: ProductOptions) => void;
}

interface CategoryData {
  id: number;
  name: string;
  icon: string;
  products: Product[];
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  // Estado de tamanho (obrigatório para pizzas)
  const [selectedSize, setSelectedSize] = useState<'P' | 'M' | 'G' | null>(null);
  
  const [selectedFlavors, setSelectedFlavors] = useState<Product[]>([product]);
  const [selectedBorder, setSelectedBorder] = useState<Product | undefined>();
  const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Estados para accordion
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  
  // Produtos carregados da API
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se o produto é uma pizza (pode ter metades)
  const isPizza = product.category_id && [8, 9, 10].includes(product.category_id);
  
  // Definir preços por tamanho e categoria
  const sizePrices = {
    classica: { P: 32.90, M: 40.90, G: 49.90 },  // Clássicas (8) e Doces (10)
    especial: { P: 36.90, M: 45.90, G: 54.90 }   // Especiais (9)
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await dotflowAPI.getProducts();
      setAllProducts(response.products.filter(p => p.active));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Organizar produtos por categorias
  const categorizedData: CategoryData[] = [
    {
      id: 8,
      name: 'Pizzas Clássicas',
      icon: '🍕',
      products: allProducts.filter(p => p.category_id === 8)
    },
    {
      id: 9,
      name: 'Pizzas Especiais',
      icon: '⭐',
      products: allProducts.filter(p => p.category_id === 9)
    },
    {
      id: 10,
      name: 'Pizzas Doces',
      icon: '🍰',
      products: allProducts.filter(p => p.category_id === 10)
    },
    {
      id: 12,
      name: 'Bordas Clássicas',
      icon: '🥖',
      products: allProducts.filter(p => p.category_id === 12)
    },
    {
      id: 13,
      name: 'Bordas Especiais',
      icon: '✨',
      products: allProducts.filter(p => p.category_id === 13)
    },
    {
      id: 11,
      name: 'Adicionais',
      icon: '🧀',
      products: allProducts.filter(p => p.category_id === 11)
    }
  ].filter(cat => cat.products.length > 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateTotalPrice = () => {
    // Se não tem tamanho selecionado para pizzas, retorna 0
    if (isPizza && !selectedSize) {
      return 0;
    }
    
    // Determinar categoria de preço baseado nos sabores
    // Se algum sabor for Especial (category_id: 9), usa preço especial
    const hasEspecial = selectedFlavors.some(f => f.category_id === 9);
    const priceCategory = hasEspecial ? 'especial' : 'classica';
    
    // Preço base da pizza pelo tamanho e categoria
    const pizzaPrice = isPizza && selectedSize 
      ? sizePrices[priceCategory][selectedSize]
      : (product.price_offer || product.price);
    
    // Preço da borda
    const borderPrice = selectedBorder ? (selectedBorder.price_offer || selectedBorder.price) : 0;
    
    // Preço dos adicionais
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + (e.price_offer || e.price), 0);

    return (pizzaPrice + borderPrice + extrasPrice) * quantity;
  };

  const handleFlavorToggle = (flavor: Product) => {
    if (selectedFlavors.find(f => f.id === flavor.id)) {
      // Se já está selecionado e não é o produto principal, remove
      if (flavor.id !== product.id) {
        setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
      }
    } else if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleBorderSelect = (border: Product) => {
    if (selectedBorder?.id === border.id) {
      setSelectedBorder(undefined);
    } else {
      setSelectedBorder(border);
    }
  };

  const handleExtraToggle = (extra: Product) => {
    if (selectedExtras.find(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const toggleAccordion = (categoryId: number) => {
    setOpenAccordions(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddToCart = () => {
    // Para pizzas, valida se tem tamanho selecionado
    if (isPizza && !selectedSize) {
      alert('Por favor, selecione o tamanho da pizza antes de adicionar ao carrinho.');
      return;
    }
    
    const options: ProductOptions = {
      size: selectedSize || 'G', // Default G para produtos que não são pizza
      flavors: selectedFlavors,
      border: selectedBorder,
      extras: selectedExtras,
      quantity
    };
    onAddToCart(product, options);
  };

  const getProductImage = (product: Product) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start lg:items-center justify-center p-4 lg:p-8">
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl lg:rounded-3xl max-w-3xl w-full my-4 lg:my-8 shadow-2xl max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header com Imagem */}
        <div className="relative">
          <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-t-2xl lg:rounded-t-3xl bg-gray-200 dark:bg-gray-700">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/pizza-brocolis-bacon-classica.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          
          {/* Botões de Ação no Header */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full transition-all hover:scale-110 shadow-lg z-10 active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-4 left-4 p-2.5 rounded-full transition-all hover:scale-110 shadow-lg ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Badge de Promoção */}
          {product.price_offer && product.price_offer < product.price && (
            <div className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              {Math.round(((product.price - product.price_offer) / product.price) * 100)}% OFF
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8">
          {/* Título e Avaliação */}
          <div className="mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">(4.2 • 150+ avaliações)</span>
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Preço Base (apenas para não-pizzas) */}
            {!isPizza && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(product.price_offer || product.price)}
                </span>
                {product.price_offer && product.price_offer < product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Seleção de Tamanho (obrigatório para pizzas) */}
          {isPizza && (
            <div className="px-4 lg:px-8 mb-4 lg:mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <h3 className="text-base lg:text-xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2 flex items-center gap-1 lg:gap-2">
                  <span className="text-lg lg:text-2xl">📏</span>
                  <span className="flex-1">Escolha o tamanho<span className="hidden sm:inline"> da sua pizza</span></span>
                  <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-3 lg:mb-4">
                  Selecione o tamanho antes de personalizar
                </p>
                
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  {(['P', 'M', 'G'] as const).map((size) => {
                    const sizeNames = { P: 'Pequena', M: 'Média', G: 'Grande' };
                    const sizeSubtext = { P: 'Broto', M: 'Família', G: 'GG' };
                    
                    // Determinar se tem sabor especial para mostrar preço correto
                    const hasEspecial = selectedFlavors.some(f => f.category_id === 9);
                    const priceCategory = hasEspecial ? 'especial' : 'classica';
                    const price = sizePrices[priceCategory][size];
                    
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-2 lg:p-4 rounded-lg lg:rounded-xl border-2 text-center transition-all transform ${
                          selectedSize === size
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/30 shadow-lg scale-105'
                            : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`text-2xl lg:text-3xl font-bold mb-0.5 lg:mb-1 ${
                          selectedSize === size ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {size}
                        </div>
                        <div className={`font-semibold text-xs lg:text-sm mb-0.5 lg:mb-1 ${
                          selectedSize === size ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {sizeNames[size]}
                        </div>
                        <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2">
                          {sizeSubtext[size]}
                        </div>
                        <div className={`text-sm lg:text-lg font-bold ${
                          selectedSize === size ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatPrice(price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {!selectedSize && (
                  <div className="mt-3 lg:mt-4 flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs lg:text-sm">
                    <span className="font-semibold">⚠️</span>
                    <span>Selecione um tamanho</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando opções...</p>
            </div>
          ) : (
            <>
              {/* Metades de Sabores (apenas para pizzas) */}
              {isPizza && (
                <div className={`mb-6 ${!selectedSize ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      🍕 Deseja metade de outro sabor?
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedFlavors.length}/2 sabores
                    </span>
          </div>

                  {!selectedSize && (
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        🔒 Selecione um tamanho primeiro para personalizar sua pizza
                      </p>
                    </div>
                  )}
                  
                  {selectedSize && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        💡 <strong>Dica:</strong> Escolha até 2 sabores para sua pizza. O preço é baseado no tamanho <strong>{selectedSize}</strong> escolhido. Se escolher um sabor Especial, o preço será ajustado automaticamente!
                      </p>
                    </div>
                  )}

                  {selectedFlavors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sabores selecionados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFlavors.map((flavor) => (
                          <div
                            key={flavor.id}
                            className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {flavor.name}
                            {flavor.id !== product.id && (
                <button
                                onClick={() => handleFlavorToggle(flavor)}
                                className="hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accordion de Sabores */}
                  <div className="space-y-2">
                    {categorizedData
                      .filter(cat => [8, 9, 10].includes(cat.id))
                      .map((category) => (
                        <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleAccordion(category.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {category.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({category.products.length})
                              </span>
                            </div>
                            {openAccordions.includes(category.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                          
                          {openAccordions.includes(category.id) && (
                            <div className="p-4 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                              {category.products.map((flavor) => {
                                const isSelected = selectedFlavors.find(f => f.id === flavor.id);
                                const isDisabled = !isSelected && selectedFlavors.length >= 2;
                                
                                // Calcular preço baseado no tamanho selecionado
                                let displayPrice = flavor.price_offer || flavor.price;
                                if (selectedSize) {
                                  // Determinar se este sabor é especial ou se já tem um especial selecionado
                                  const wouldBeEspecial = flavor.category_id === 9 || selectedFlavors.some(f => f.category_id === 9);
                                  const priceCategory = wouldBeEspecial ? 'especial' : 'classica';
                                  displayPrice = sizePrices[priceCategory][selectedSize];
                                }
                                
                                return (
                                  <button
                                    key={flavor.id}
                                    onClick={() => handleFlavorToggle(flavor)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg border text-left transition-all ${
                                      isSelected
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                        : isDisabled
                                        ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className={`font-medium ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
                                          {flavor.name}
                                          {selectedSize && flavor.category_id === 9 && (
                                            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                              Especial
                                            </span>
                                          )}
                                        </div>
                                        {flavor.description && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {flavor.description}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right ml-3">
                                        <div className={`font-semibold ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                          {formatPrice(displayPrice)}
                                        </div>
                                        {selectedSize && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Tam. {selectedSize}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
              ))}
            </div>
          </div>
              )}

              {/* Bordas */}
              {categorizedData.filter(cat => [12, 13].includes(cat.id)).length > 0 && (
          <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🥖 Deseja adicionar borda recheada?
            </h3>
                  
                  <div className="space-y-2">
                    {categorizedData
                      .filter(cat => [12, 13].includes(cat.id))
                      .map((category) => (
                        <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleAccordion(category.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {category.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({category.products.length})
                              </span>
                            </div>
                            {openAccordions.includes(category.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                          
                          {openAccordions.includes(category.id) && (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {category.products.map((border) => {
                                const isSelected = selectedBorder?.id === border.id;
                                
                                return (
                <button
                  key={border.id}
                                    onClick={() => handleBorderSelect(border)}
                                    className={`p-3 rounded-lg border text-left transition-all ${
                                      isSelected
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <div className={`font-medium ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
                                      {border.name}
                                    </div>
                                    <div className={`text-sm mt-1 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                      +{formatPrice(border.price_offer || border.price)}
                                    </div>
                                  </button>
                                );
                              })}
                    </div>
                  )}
                        </div>
              ))}
            </div>
          </div>
              )}

          {/* Adicionais */}
              {categorizedData.filter(cat => cat.id === 11).length > 0 && (
          <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      🧀 Adicionais
            </h3>
                    {selectedExtras.length > 0 && (
                      <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full font-medium">
                        {selectedExtras.length} selecionado{selectedExtras.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {categorizedData
                    .filter(cat => cat.id === 11)
                    .map((category) => (
                      <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleAccordion(category.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Ingredientes Extras
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({category.products.length})
                            </span>
                          </div>
                          {openAccordions.includes(category.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        
                        {openAccordions.includes(category.id) && (
                          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {category.products.map((extra) => {
                              const isSelected = selectedExtras.find(e => e.id === extra.id);
                              
                              return (
                <button
                  key={extra.id}
                                  onClick={() => handleExtraToggle(extra)}
                                  className={`p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <div className={`font-medium text-sm ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
                                    {extra.name}
                                  </div>
                                  <div className={`text-xs mt-1 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    +{formatPrice(extra.price_offer || extra.price)}
                  </div>
                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
              ))}
            </div>
              )}
            </>
          )}

          {/* Quantidade e Preço Total */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Quantidade
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="w-12 text-center text-xl font-bold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                Total
              </span>
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatPrice(calculateTotalPrice())}
              </span>
            </div>

            {/* Detalhamento do Preço */}
            {(isPizza || selectedBorder || selectedExtras.length > 0) && selectedSize && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                {isPizza && selectedSize && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>
                      Pizza Tamanho {selectedSize} 
                      {selectedFlavors.length > 1 && ` (${selectedFlavors.length} sabores)`}
                      {selectedFlavors.some(f => f.category_id === 9) && ' - Especial'}
                    </span>
                    <span>
                      {formatPrice(
                        sizePrices[selectedFlavors.some(f => f.category_id === 9) ? 'especial' : 'classica'][selectedSize]
                      )}
                    </span>
                  </div>
                )}
                {selectedBorder && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Borda ({selectedBorder.name})</span>
                    <span>+{formatPrice(selectedBorder.price_offer || selectedBorder.price)}</span>
                  </div>
                )}
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Adicionais ({selectedExtras.length})</span>
                    <span>
                      +{formatPrice(selectedExtras.reduce((sum, e) => sum + (e.price_offer || e.price), 0))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            {/* Botão Cancelar (visível apenas no mobile) */}
            <button
              onClick={onClose}
              className="lg:hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              aria-label="Cancelar"
            >
              <X className="w-6 h-6" />
            </button>

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
              <Plus className="w-6 h-6" />
              <span className="hidden sm:inline">Adicionar ao Carrinho</span>
              <span className="sm:hidden">Adicionar</span>
          </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
