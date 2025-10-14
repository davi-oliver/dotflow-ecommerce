import { Product, Category } from '@/types/dotflow';

export interface FilterOptions {
  category?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasPromotion?: boolean;
  tags?: string[];
}

export interface PizzaCategory {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  categoryIds?: number[];
  tags?: string[];
}

export class ProductFilterService {
  // Categorias de pizza com mapeamento inteligente baseado na API DotFlow
  private static pizzaCategories: PizzaCategory[] = [
    {
      id: 'all',
      name: 'Todas',
      icon: '🍕',
      keywords: [],
    },
    {
      id: 'classicas',
      name: 'Clássicas',
      icon: '🍕',
      keywords: [
        'margherita', 'marguerita', 'pepperoni', 'portuguesa', 'calabresa', 
        'napolitana', 'quatro queijos', '4 queijos', 'americana', 'presunto',
        'tradicional', 'clássica', 'clássico', 'mussarela', 'bacon', 'frango',
        'milho'
      ],
      categoryIds: [8], // ID da categoria "Clássicas" na API
      tags: ['classica', 'tradicional', 'tradicionais']
    },
    {
      id: 'especiais',
      name: 'Especiais',
      icon: '⭐',
      keywords: [
        'especial', 'premium', 'gourmet', 'artesanal', 'frango catupiry',
        'frango cheddar', 'brocolis bacon', 'catupiry', 'cheddar', 
        'gorgonzola', 'provolone', 'calabresa catupiry', 'presunto catupiry',
        'go pizza'
      ],
      categoryIds: [9], // ID da categoria "Especiais" na API
      tags: ['especial', 'especiais', 'premium', 'gourmet']
    },
    {
      id: 'doces',
      name: 'Doces',
      icon: '🍰',
      keywords: [
        'chocolate', 'morango', 'banana', 'doce', 'nutella', 'brigadeiro',
        'romeu e julieta', 'banoffee', 'choconinho', 'sensação', 'chocobis',
        'chocorango', 'go chocolate'
      ],
      categoryIds: [10], // ID da categoria "Doces" na API
      tags: ['doce', 'doces', 'sobremesa']
    },
    {
      id: 'adicionais',
      name: 'Adicionais',
      icon: '🧀',
      keywords: [
        'ingrediente', 'adicional', 'extra', 'catupiry', 'bacon', 'mussarela',
        'cheddar', 'pepperoni', 'frango', 'calabresa', 'presunto', 'alho',
        'chocolate', 'morango', 'leite'
      ],
      categoryIds: [11], // ID da categoria "Adicionais" na API
      tags: ['adicional', 'adicionais', 'ingrediente', 'extra']
    },
    {
      id: 'bordas-classicas',
      name: 'Bordas Clássicas',
      icon: '🥖',
      keywords: [
        'borda', 'catupiry', 'cheddar', 'chocolate', 'mussarela', 'recheada'
      ],
      categoryIds: [12], // ID da categoria "Bordas Clássicas" na API
      tags: ['borda', 'bordas', 'recheada']
    },
    {
      id: 'bordas-especiais',
      name: 'Bordas Especiais',
      icon: '✨',
      keywords: [
        'borda', 'catucheddar', 'frango queijo', 'presunto queijo', 
        'calabresa queijo', 'bacon', 'especial', 'recheada'
      ],
      categoryIds: [13], // ID da categoria "Bordas Especiais" na API
      tags: ['borda', 'bordas', 'especial', 'recheada']
    },
    {
      id: 'combos',
      name: 'Combos',
      icon: '📦',
      keywords: [
        'combo', 'promoção', 'pacote', 'kit', 'família', 'pizza grande',
        'broto doce', 'mantiqueira', 'refrigerante'
      ],
      categoryIds: [14], // ID da categoria "Combos" na API
      tags: ['combo', 'combos', 'promocao', 'kit']
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      icon: '🥤',
      keywords: [
        'refrigerante', 'suco', 'água', 'cerveja', 'bebida', 'coca',
        'guaraná', 'fanta', 'sprite', 'pepsi', 'mantiqueira', 'coca-cola'
      ],
      categoryIds: [15], // ID da categoria "Bebidas" na API
      tags: ['bebida', 'bebidas', 'drink']
    }
  ];

  /**
   * Filtra produtos baseado em múltiplos critérios
   */
  static filterProducts(products: Product[], options: FilterOptions): Product[] {
    return products.filter(product => {
      // Filtro por categoria
      if (options.category && options.category !== 'all') {
        if (!this.matchesCategory(product, options.category)) {
          return false;
        }
      }

      // Filtro por termo de busca
      if (options.searchTerm) {
        if (!this.matchesSearchTerm(product, options.searchTerm)) {
          return false;
        }
      }

      // Filtro por preço
      if (options.minPrice !== undefined && product.price < options.minPrice) {
        return false;
      }

      if (options.maxPrice !== undefined && product.price > options.maxPrice) {
        return false;
      }

      // Filtro por estoque
      if (options.inStock && product.ammount_stock <= 0) {
        return false;
      }

      // Filtro por promoção
      if (options.hasPromotion && (!product.price_offer || product.price_offer >= product.price)) {
        return false;
      }

      // Filtro por tags
      if (options.tags && options.tags.length > 0) {
        if (!this.matchesTags(product, options.tags)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Verifica se um produto corresponde a uma categoria
   */
  private static matchesCategory(product: Product, categoryId: string): boolean {
    const category = this.pizzaCategories.find(cat => cat.id === categoryId);
    if (!category) return false;

    // Se a categoria tem IDs definidos, usa APENAS o category_id para filtrar
    // Isso garante que apenas produtos da categoria correta sejam exibidos
    if (category.categoryIds && category.categoryIds.length > 0) {
      // O produto DEVE ter um category_id correspondente
      if (product.category_id && category.categoryIds.includes(product.category_id)) {
        return true;
      }
      // Se a categoria tem IDs definidos mas o produto não corresponde, retorna false
      return false;
    }

    // Fallback: Se a categoria não tem IDs definidos, usa keywords/tags
    // (útil para categorias customizadas sem mapeamento direto da API)
    
    // Verifica por keywords no nome
    const productName = product.name.toLowerCase();
    if (category.keywords.some(keyword => productName.includes(keyword))) {
      return true;
    }

    // Verifica por tags
    if (category.tags && product.tags) {
      if (category.tags.some(tag => product.tags!.includes(tag))) {
        return true;
      }
    }

    // Verifica por descrição
    if (product.description) {
      const description = product.description.toLowerCase();
      if (category.keywords.some(keyword => description.includes(keyword))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica se um produto corresponde ao termo de busca
   */
  private static matchesSearchTerm(product: Product, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    
    // Busca no nome
    if (product.name.toLowerCase().includes(term)) {
      return true;
    }

    // Busca na descrição
    if (product.description && product.description.toLowerCase().includes(term)) {
      return true;
    }

    // Busca nas tags
    if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(term))) {
      return true;
    }

    return false;
  }

  /**
   * Verifica se um produto corresponde às tags especificadas
   */
  private static matchesTags(product: Product, tags: string[]): boolean {
    if (!product.tags) return false;
    
    return tags.some(tag => 
      product.tags!.some(productTag => 
        productTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  /**
   * Retorna as categorias disponíveis
   */
  static getCategories(): PizzaCategory[] {
    return this.pizzaCategories;
  }

  /**
   * Retorna produtos em destaque baseado em critérios
   */
  static getHighlightProducts(products: Product[], limit: number = 6): Product[] {
    // Prioriza produtos com promoção, em estoque e mais populares
    return products
      .filter(product => product.active && product.ammount_stock > 0)
      .sort((a, b) => {
        // Prioriza produtos com promoção
        const aHasPromotion = a.price_offer && a.price_offer < a.price;
        const bHasPromotion = b.price_offer && b.price_offer < b.price;
        
        if (aHasPromotion && !bHasPromotion) return -1;
        if (!aHasPromotion && bHasPromotion) return 1;
        
        // Depois prioriza por preço (mais baratos primeiro)
        return a.price - b.price;
      })
      .slice(0, limit);
  }

  /**
   * Agrupa produtos por categoria
   */
  static groupProductsByCategory(products: Product[]): Record<string, Product[]> {
    const grouped: Record<string, Product[]> = {};
    
    this.pizzaCategories.forEach(category => {
      if (category.id === 'all') return;
      
      grouped[category.id] = this.filterProducts(products, { category: category.id });
    });

    return grouped;
  }

  /**
   * Sugere produtos similares
   */
  static getSimilarProducts(product: Product, allProducts: Product[], limit: number = 4): Product[] {
    const productTags = product.tags || [];
    const productCategory = product.category_id;
    
    return allProducts
      .filter(p => p.id !== product.id && p.active && p.ammount_stock > 0)
      .map(p => ({
        product: p,
        score: this.calculateSimilarityScore(product, p, productTags, productCategory)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  /**
   * Calcula score de similaridade entre produtos
   */
  private static calculateSimilarityScore(
    product: Product, 
    other: Product, 
    productTags: string[], 
    productCategory: number | undefined
  ): number {
    let score = 0;

    // Mesma categoria = +10 pontos
    if (productCategory && other.category_id === productCategory) {
      score += 10;
    }

    // Tags em comum = +5 pontos cada
    if (other.tags) {
      const commonTags = other.tags.filter(tag => 
        productTags.some(ptag => ptag.toLowerCase() === tag.toLowerCase())
      );
      score += commonTags.length * 5;
    }

    // Faixa de preço similar = +3 pontos
    const priceDiff = Math.abs(product.price - other.price);
    if (priceDiff < product.price * 0.2) { // 20% de diferença
      score += 3;
    }

    return score;
  }
}
