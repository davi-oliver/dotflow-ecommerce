'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/dotflow';

export interface CartItemOptions {
  size?: 'P' | 'M' | 'G';  // Tamanho da pizza
  flavors?: Product[];     // Array de produtos (para metades de sabores)
  border?: Product;        // Produto de borda (opcional)
  extras?: Product[];      // Array de produtos adicionais
  quantity?: number;       // Quantidade do item (já está no CartItem, mas mantido por compatibilidade)
}

export interface CartItem {
  product: Product;
  quantity: number;
  options?: CartItemOptions;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number, options?: CartItemOptions) => void;
  addItem: (product: Product, quantity: number, options?: CartItemOptions) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('dotflow-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('dotflow-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1, options?: CartItemOptions) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.product.id === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      );
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && JSON.stringify(item.options) === JSON.stringify(options)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity, options }];
      }
    });
  };

  const addItem = (product: Product, quantity: number, options?: CartItemOptions) => {
    addToCart(product, quantity, options);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    // Tabela de preços por tamanho
    const sizePrices = {
      classica: { P: 32.90, M: 40.90, G: 49.90 },
      especial: { P: 36.90, M: 45.90, G: 54.90 }
    };
    
    return items.reduce((total, item) => {
      let pizzaPrice = item.product.price_offer || item.product.price;
      
      // Se o produto é uma pizza (categories 8, 9, 10) e tem tamanho definido
      const isPizza = item.product.category_id && [8, 9, 10].includes(item.product.category_id);
      
      if (isPizza && item.options?.size) {
        // Determinar se tem sabor especial
        const hasEspecial = item.options.flavors?.some(f => f.category_id === 9) || 
                           item.product.category_id === 9;
        const priceCategory = hasEspecial ? 'especial' : 'classica';
        
        // Usar preço da tabela baseado no tamanho e categoria
        pizzaPrice = sizePrices[priceCategory][item.options.size];
      }
      
      // Calcular preço adicional das opções (borda e extras)
      let optionsPrice = 0;
      
      if (item.options) {
        // Preço da borda
        if (item.options.border) {
          optionsPrice += item.options.border.price_offer || item.options.border.price;
        }
        
        // Preço dos adicionais
        if (item.options.extras && item.options.extras.length > 0) {
          optionsPrice += item.options.extras.reduce(
            (sum, extra) => sum + (extra.price_offer || extra.price), 
            0
          );
        }
      }
      
      return total + ((pizzaPrice + optionsPrice) * item.quantity);
    }, 0);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const value = {
    items,
    isOpen,
    addToCart,
    addItem,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 