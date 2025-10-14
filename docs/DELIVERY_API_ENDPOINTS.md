# Endpoints da API para Delivery

## Visão Geral

Este documento descreve os novos endpoints criados especificamente para o sistema de delivery da pizzaria, que separa produtos principais de complementos.

## Estrutura de Categorias

### Produtos Principais (Categorias 1, 2, 3, 7, 8)
- **Categoria 1**: Pizzas tradicionais
- **Categoria 2**: Pizzas especiais
- **Categoria 3**: Bebidas
- **Categoria 7**: Sobremesas
- **Categoria 8**: Promoções

### Complementos (Categorias 4, 5, 6)
- **Categoria 4**: Bordas de pizza
- **Categoria 5**: Adicionais/Extras
- **Categoria 6**: Acompanhamentos

## Novos Endpoints

### 1. Buscar Produtos por Categorias

**Endpoint:** `GET ?resource=products&action=list_by_categories&category_ids={ids}`

**Parâmetros:**
- `category_ids`: Lista de IDs de categorias separados por vírgula

**Exemplo:**
```
GET ?resource=products&action=list_by_categories&category_ids=1,2,3,7,8
```

**Resposta:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Pizza Margherita",
      "category_id": 1,
      "price": 25.90,
      "description": "Molho de tomate, mussarela e manjericão",
      // ... outros campos do produto
    }
  ]
}
```

### 2. Produtos Principais do Delivery

**Endpoint:** `GET ?resource=products&action=list_by_categories&category_ids=1,2,3,7,8`

**Método da API:** `getDeliveryMainProducts()`

**Descrição:** Retorna todos os produtos das categorias principais (pizzas, bebidas, sobremesas, promoções).

**Uso no Frontend:**
```typescript
import { dotflowAPI } from '@/lib/dotflow-api';

// Buscar produtos principais
const mainProducts = await dotflowAPI.getDeliveryMainProducts();
console.log(mainProducts.products);
```

### 3. Complementos do Delivery

**Endpoint:** `GET ?resource=products&action=list_by_categories&category_ids=4,5,6`

**Método da API:** `getDeliveryComplements()`

**Descrição:** Retorna todos os produtos complementares (bordas, adicionais, acompanhamentos).

**Uso no Frontend:**
```typescript
import { dotflowAPI } from '@/lib/dotflow-api';

// Buscar complementos
const complements = await dotflowAPI.getDeliveryComplements();
console.log(complements.products);
```

## Implementação no Backend

O backend deve implementar o endpoint `list_by_categories` que:

1. Recebe o parâmetro `category_ids` (string com IDs separados por vírgula)
2. Converte para array de números
3. Filtra produtos onde `category_id` está na lista
4. Retorna apenas produtos ativos (`active = true`)

**Exemplo de implementação SQL:**
```sql
SELECT * FROM products 
WHERE category_id IN (1, 2, 3, 7, 8) 
AND active = true 
ORDER BY name;
```

## Uso no Frontend

### Componente de Delivery

```typescript
// src/components/delivery/DeliveryProducts.tsx
import { useEffect, useState } from 'react';
import { dotflowAPI } from '@/lib/dotflow-api';
import { Product } from '@/types/dotflow';

export function DeliveryProducts() {
  const [mainProducts, setMainProducts] = useState<Product[]>([]);
  const [complements, setComplements] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [mainResponse, complementsResponse] = await Promise.all([
          dotflowAPI.getDeliveryMainProducts(),
          dotflowAPI.getDeliveryComplements()
        ]);

        setMainProducts(mainResponse.products);
        setComplements(complementsResponse.products);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Produtos Principais</h2>
      {/* Renderizar produtos principais */}
      
      <h2>Complementos</h2>
      {/* Renderizar complementos */}
    </div>
  );
}
```

## Vantagens

1. **Separação Clara**: Produtos principais e complementos são tratados separadamente
2. **Performance**: Menos dados transferidos por requisição
3. **Flexibilidade**: Fácil de modificar quais categorias pertencem a cada grupo
4. **UX Melhorada**: Interface pode ser organizada por tipo de produto

## Endpoints Necessários no Backend

Certifique-se de que sua API DotFlow implementa:

- `GET ?resource=products&action=list_by_categories&category_ids={ids}`

Onde `{ids}` é uma string com IDs separados por vírgula (ex: "1,2,3,7,8").


