'use client';

import { Product } from '@/types/dotflow';
import { ProductGrid } from './ProductGrid';
import { ProductFilterService } from '@/services/productFilterService';

interface CategorizedProductSectionsProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  searchTerm?: string;
}

interface ProductSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  products: Product[];
  priority: number;
}

export function CategorizedProductSections({ 
  products, 
  onProductSelect, 
  searchTerm = '' 
}: CategorizedProductSectionsProps) {
  
  // Organiza produtos em seções baseadas nas categorias
  const getProductSections = (): ProductSection[] => {
    const sections: ProductSection[] = [];
    
    // Seção de Combos (prioridade alta)
    const combos = ProductFilterService.filterProducts(products, { 
      category: 'combos',
      searchTerm: searchTerm.trim() || undefined
    });
    
    if (combos.length > 0) {
      sections.push({
        id: 'combos',
        title: 'Combos',
        subtitle: 'Pacotes especiais com o melhor custo-benefício',
        icon: '📦',
        products: combos,
        priority: 1
      });
    }
    
    // Seção de Pizzas Clássicas (prioridade alta)
    const classicas = ProductFilterService.filterProducts(products, { 
      category: 'classicas',
      searchTerm: searchTerm.trim() || undefined
    });
    
    if (classicas.length > 0) {
      sections.push({
        id: 'classicas',
        title: 'Pizzas Clássicas',
        subtitle: 'Sabores tradicionais que conquistaram o Brasil',
        icon: '🍕',
        products: classicas,
        priority: 2
      });
    }
    
    // Seção de Pizzas Especiais (prioridade alta)
    const especiais = ProductFilterService.filterProducts(products, { 
      category: 'especiais',
      searchTerm: searchTerm.trim() || undefined
    });
    
    if (especiais.length > 0) {
      sections.push({
        id: 'especiais',
        title: 'Pizzas Especiais',
        subtitle: 'Criações únicas com ingredientes premium',
        icon: '⭐',
        products: especiais,
        priority: 3
      });
    }
    
    // Seção de Pizzas Doces (prioridade média)
    const doces = ProductFilterService.filterProducts(products, { 
      category: 'doces',
      searchTerm: searchTerm.trim() || undefined
    });
    
    if (doces.length > 0) {
      sections.push({
        id: 'doces',
        title: 'Pizzas Doces',
        subtitle: 'Sobremesas irresistíveis para finalizar sua refeição',
        icon: '🍰',
        products: doces,
        priority: 4
      });
    }
    
    // Seção de Bebidas (prioridade média)
    const bebidas = ProductFilterService.filterProducts(products, { 
      category: 'bebidas',
      searchTerm: searchTerm.trim() || undefined
    });
    
    if (bebidas.length > 0) {
      sections.push({
        id: 'bebidas',
        title: 'Bebidas',
        subtitle: 'Refrigerantes, sucos e muito mais',
        icon: '🥤',
        products: bebidas,
        priority: 5
      });
    }
    
    // NOTA: Seções removidas da listagem principal:
    // - Adicionais: só aparece quando uma categoria clássica, especial ou doce está selecionada
    // - Bordas Clássicas: não deve aparecer na listagem principal
    // - Bordas Especiais: não deve aparecer na listagem principal
    
    // Ordena por prioridade
    return sections.sort((a, b) => a.priority - b.priority);
  };
  
  const sections = getProductSections();
  
  // Se não há seções com produtos, mostra mensagem
  if (sections.length === 0) {
    return (
      <div className="text-center py-16 lg:py-24">
        <div className="text-6xl lg:text-8xl mb-4">🔍</div>
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-400 text-sm lg:text-base">
          {searchTerm 
            ? `Não encontramos produtos para "${searchTerm}". Tente outro termo.`
            : 'Não há produtos disponíveis no momento.'
          }
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 lg:space-y-12">
      {sections.map((section) => (
        <section key={section.id} className="relative">
          {/* Header da Seção */}
          <div className="mb-4 lg:mb-6">
            <div className="flex items-start gap-3 lg:gap-4 mb-3">
              <span className="text-2xl lg:text-3xl flex-shrink-0">{section.icon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-1">
                  {section.title}
                </h2>
                <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                  {section.subtitle}
                </p>
              </div>
            </div>
            
            {/* Contador de produtos */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                {section.products.length} {section.products.length === 1 ? 'produto' : 'produtos'}
              </span>
              
              {/* Indicador visual de prioridade alta */}
              {(section.id === 'combos' || section.id === 'classicas' || section.id === 'especiais') && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-700/30">
                  ⭐ Destaque
                </span>
              )}
            </div>
          </div>
          
          {/* Grid de Produtos */}
          <div className="relative">
            <ProductGrid 
              products={section.products}
              onProductSelect={onProductSelect}
            />
          </div>
          
          {/* Separador visual entre seções */}
          {section.id !== sections[sections.length - 1].id && (
            <div className="mt-6 lg:mt-8 border-t border-gray-700/50"></div>
          )}
        </section>
      ))}
    </div>
  );
}
