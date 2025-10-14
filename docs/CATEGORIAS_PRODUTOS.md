# 📋 Mapeamento de Categorias de Produtos

Este documento descreve o mapeamento entre as categorias da API DotFlow e o sistema de filtragem do e-commerce.

## 🎯 Categorias da API DotFlow

As categorias são retornadas pela API com os seguintes IDs:

| ID  | Nome              | Descrição                          |
|-----|-------------------|------------------------------------|
| 8   | Clássicas         | Pizzas tradicionais                |
| 9   | Especiais         | Pizzas premium e gourmet           |
| 10  | Doces             | Pizzas doces e sobremesas          |
| 11  | Adicionais        | Ingredientes extras                |
| 12  | Bordas Clássicas  | Bordas recheadas tradicionais      |
| 13  | Bordas Especiais  | Bordas recheadas premium           |
| 14  | Combos            | Promoções e pacotes                |
| 15  | Bebidas           | Refrigerantes e outras bebidas     |

## 🔍 Como Funciona a Filtragem

O sistema de filtragem (`ProductFilterService`) usa múltiplos critérios para categorizar produtos:

### 1. Por `category_id`
O filtro principal utiliza o campo `category_id` do produto para fazer o match direto com as categorias.

**Exemplo:**
```typescript
// Produto com category_id = 8 será filtrado como "Clássicas"
{
  id: 21,
  name: "Americana",
  category_id: 8,  // ← Categoria "Clássicas"
  price: 35.9,
  ...
}
```

### 2. Por Keywords
Caso o `category_id` não esteja presente, o sistema busca palavras-chave no nome e descrição do produto.

**Exemplo:**
```typescript
// Categorias com suas keywords
{
  id: 'classicas',
  categoryIds: [8],
  keywords: ['marguerita', 'pepperoni', 'calabresa', 'portuguesa', ...]
}
```

### 3. Por Tags
Produtos podem ter tags que também são usadas na filtragem.

## 📱 Uso na Interface

### Abas de Categorias

Quando o usuário clica em uma categoria (ex: "Clássicas"), o sistema:

1. **Filtra** todos os produtos com `category_id === 8`
2. **Busca** produtos que contenham keywords relevantes
3. **Exibe** apenas os produtos correspondentes

**Código:**
```typescript
// No componente CategoryTabs
<button onClick={() => onCategorySelect('classicas')}>
  🍕 Clássicas
</button>

// Isso dispara o filtro:
filteredProducts = products.filter(p => p.category_id === 8)
```

### Categoria "Todas"

A categoria especial "Todas" (`id: 'all'`) exibe todos os produtos ativos sem filtrar por categoria.

## 🛠️ Exemplos de Produtos por Categoria

### Clássicas (category_id: 8)
- Americana
- Bacon
- Calabresa
- Frango com Cheddar
- Marguerita
- Portuguesa
- Quatro Queijos

### Especiais (category_id: 9)
- Brócolis com Bacon e Catupiry
- Calabresa com Catupiry
- Frango com Catupiry e Cheddar
- Go Pizza Especial

### Doces (category_id: 10)
- Go Chocolate
- Go Chocobis
- Go Choconinho
- Go Sensação

### Adicionais (category_id: 11)
- Catupiry
- Bacon
- Mussarela
- Cheddar
- Chocolate
- Morango

### Bordas Clássicas (category_id: 12)
- Borda de Catupiry
- Borda de Cheddar
- Borda de Chocolate
- Borda de Mussarela

### Bordas Especiais (category_id: 13)
- Borda de Catucheddar
- Borda de Frango com Queijo
- Borda de Presunto e Queijo
- Borda de Calabresa com Queijo
- Borda de Catupiry com Bacon

### Combos (category_id: 14)
- 1 Pizza Grande + Broto Doce + Mantiqueira 2L
- 2 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L
- 3 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L
- 4 Pizzas Grandes Clássicas ou Doces + 2 Mantiqueira 2L
- 1 Broto Clássico ou Doce + 2 Refrigerantes 200ml

### Bebidas (category_id: 15)
- Refrigerante genérico
- Coca-Cola
- Mantiqueira

## 🚀 Implementação Técnica

### Arquivo: `productFilterService.ts`

O serviço principal que gerencia a lógica de filtragem:

```typescript
// Configuração da categoria Clássicas
{
  id: 'classicas',
  name: 'Clássicas',
  icon: '🍕',
  categoryIds: [8], // ← ID da API
  keywords: ['marguerita', 'calabresa', ...],
  tags: ['classica', 'tradicional']
}
```

### Método de Filtragem

```typescript
static filterProducts(products: Product[], options: FilterOptions): Product[] {
  return products.filter(product => {
    // Filtro por categoria
    if (options.category && options.category !== 'all') {
      if (!this.matchesCategory(product, options.category)) {
        return false;
      }
    }
    // ... outros filtros
  });
}
```

### Verificação de Categoria

```typescript
private static matchesCategory(product: Product, categoryId: string): boolean {
  const category = this.pizzaCategories.find(cat => cat.id === categoryId);
  
  // 1. Verifica por category_id (prioridade)
  if (category.categoryIds && product.category_id) {
    if (category.categoryIds.includes(product.category_id)) {
      return true;
    }
  }
  
  // 2. Verifica por keywords
  const productName = product.name.toLowerCase();
  if (category.keywords.some(keyword => productName.includes(keyword))) {
    return true;
  }
  
  // 3. Verifica por tags
  if (category.tags && product.tags) {
    if (category.tags.some(tag => product.tags.includes(tag))) {
      return true;
    }
  }
  
  return false;
}
```

## 📊 Fluxo de Dados

```mermaid
API DotFlow → Products with category_id
       ↓
ProductFilterService → Aplica filtros
       ↓
useProductFilters Hook → Gerencia estado
       ↓
CategoryTabs Component → Interface do usuário
       ↓
ProductGrid → Exibe produtos filtrados
```

## 🔧 Manutenção

### Adicionar Nova Categoria

1. Obtenha o `category_id` da API
2. Adicione ao array `pizzaCategories` em `productFilterService.ts`
3. Configure:
   - `id`: identificador único (ex: 'nova-categoria')
   - `name`: nome exibido na UI
   - `icon`: emoji representativo
   - `categoryIds`: array com IDs da API
   - `keywords`: palavras-chave para busca
   - `tags`: tags relacionadas

### Atualizar Keywords

Edite o array `keywords` da categoria correspondente para melhorar a precisão da busca.

## ✅ Testes

Para verificar se a filtragem está funcionando:

1. Acesse `/delivery`
2. Clique na aba "Clássicas"
3. Verifique se apenas produtos com `category_id: 8` aparecem
4. Teste as outras categorias
5. Use a busca para verificar se as keywords funcionam

## 📝 Notas Importantes

- O `category_id` é o filtro **principal** e mais confiável
- Keywords servem como **fallback** quando o category_id não está presente
- A categoria "Todas" ignora o filtro de categoria
- Produtos inativos (`active: false`) são automaticamente excluídos
- Produtos sem estoque podem ser filtrados com `inStock: true`

