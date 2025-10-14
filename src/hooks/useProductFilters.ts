import { useState, useMemo } from 'react';
import { Product } from '@/types/dotflow';
import { ProductFilterService, FilterOptions, PizzaCategory } from '@/services/productFilterService';

export interface UseProductFiltersReturn {
  // Estados
  selectedCategory: string;
  searchTerm: string;
  filters: FilterOptions;
  
  // Dados processados
  categories: PizzaCategory[];
  filteredProducts: Product[];
  highlightProducts: Product[];
  
  // Ações
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  
  // Utilitários
  getProductsByCategory: (categoryId: string) => Product[];
  getSimilarProducts: (product: Product) => Product[];
}

export function useProductFilters(products: Product[]): UseProductFiltersReturn {
  // Estados locais
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTermState] = useState<string>('');
  const [filters, setFiltersState] = useState<FilterOptions>({});

  // Categorias disponíveis
  const categories = ProductFilterService.getCategories();

  // Produtos filtrados usando o serviço
  const filteredProducts = useMemo(() => {
    const filterOptions: FilterOptions = {
      ...filters,
      category: selectedCategory,
      searchTerm: searchTerm.trim() || undefined,
    };

    return ProductFilterService.filterProducts(products, filterOptions);
  }, [products, selectedCategory, searchTerm, filters]);

  // Produtos em destaque
  const highlightProducts = useMemo(() => {
    return ProductFilterService.getHighlightProducts(products);
  }, [products]);

  // Ações
  const setCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const setSearchTerm = (term: string) => {
    setSearchTermState(term);
  };

  const setFilters = (newFilters: Partial<FilterOptions>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setFiltersState({});
  };

  // Utilitários
  const getProductsByCategory = (categoryId: string) => {
    return ProductFilterService.filterProducts(products, { category: categoryId });
  };

  const getSimilarProducts = (product: Product) => {
    return ProductFilterService.getSimilarProducts(product, products);
  };

  return {
    // Estados
    selectedCategory,
    searchTerm,
    filters,
    
    // Dados processados
    categories,
    filteredProducts,
    highlightProducts,
    
    // Ações
    setCategory,
    setSearchTerm,
    setFilters,
    clearFilters,
    
    // Utilitários
    getProductsByCategory,
    getSimilarProducts,
  };
}
