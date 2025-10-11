# Checkout Externo - Documentação

## Visão Geral

O sistema foi refatorado para usar um checkout externo em vez de uma página interna. Quando o usuário clica em "Finalizar Compra" no carrinho, o sistema:

1. **Cria um pedido** na API DotFlow com todos os itens do carrinho
2. **Gera uma URL** com parâmetros para o checkout externo
3. **Redireciona** o usuário para a página externa de checkout

## Fluxo de Funcionamento

### 1. Criação do Pedido

Antes do redirecionamento, o sistema cria um pedido na API DotFlow com:

```json
{
  "customer_id": 123,
  "corporate_id": 9,
  "project_id": 6,
  "total_amount": 250.00,
  "subtotal": 250.00,
  "status": "pending",
  "source": "ecommerce",
  "payment_status": "pending",
  "payment_method": "pending",
  "tax_amount": 0,
  "discount_amount": 0,
  "shipping_amount": 15.90,
  "notes": "Pedido criado via e-commerce - 08/01/2025 15:30:00",
  "metadata": {
    "cart_items_count": 5,
    "checkout_completed_at": "2025-01-08T15:30:00.000Z",
    "platform": "ecommerce_frontend",
    "source": "ecommerce"
  },
  "order_items": [
    {
      "product_id": 24,
      "quantity": 1,
      "unit_price": 32.90,
      "total_price": 32.90,
      "discount_amount": 0,
      "notes": "Pizza Grande Calabresa, Borda de Chocolate",
      "metadata": "{\"product_name\": \"Pizza Calabresa\", \"options\": {...}}"
    }
  ]
}
```

### 2. Geração da URL de Checkout

A URL gerada seguirá este padrão:

```
https://localhost:3001/checkout?amount=25000&currency=brl&description=Carrinho%20com%205%20itens&customer_id=123&meta_customer_name=João%20Silva&meta_customer_phone=(11)%2099999-9999&meta_order_id=ORDER_123&meta_items_count=5&meta_cart_total=250.00&meta_item_1=Produto%20A%20(Qtd:%201)&meta_item_2=Produto%20B%20(Qtd:%202)&meta_item_3=Produto%20C%20(Qtd:%201)&meta_item_4=Produto%20D%20(Qtd:%201)&meta_item_5=Produto%20E%20(Qtd:%201)&meta_source=ecommerce&meta_campaign=black_friday
```

### 3. Parâmetros da URL

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `amount` | Valor total em centavos | `25000` (R$ 250,00) |
| `currency` | Moeda | `brl` |
| `description` | Descrição do pedido | `Carrinho com 5 itens` |
| `customer_id` | ID do cliente (ou null) | `123` ou `null` |
| `meta_customer_name` | Nome do cliente | `João Silva` |
| `meta_customer_phone` | Telefone do cliente | `(11) 99999-9999` |
| `meta_order_id` | ID do pedido criado | `ORDER_123` |
| `meta_items_count` | Quantidade de itens | `5` |
| `meta_cart_total` | Total do carrinho | `250.00` |
| `meta_item_X` | Descrição de cada item | `Produto A (Qtd: 1)` |
| `meta_source` | Origem do pedido | `ecommerce` |
| `meta_campaign` | Campanha | `black_friday` |

## Arquivos Modificados

### 1. Removidos
- `src/app/checkout/page.tsx` - Página de checkout interna removida

### 2. Criados
- `src/services/checkoutService.ts` - Serviço para gerenciar checkout externo

### 3. Modificados
- `src/components/ShoppingCart.tsx` - Agora redireciona para checkout externo
- `src/config/app.ts` - Adicionado `projectId`

## Como Usar

### No Componente ShoppingCart

```typescript
import { CheckoutService } from '@/services/checkoutService';
import { useAuth } from '@/contexts/AuthContext';

const { customer } = useAuth();

const handleCheckout = async () => {
  try {
    await CheckoutService.redirectToExternalCheckout(
      cart.items,
      customer?.id,
      customer?.name,
      customer?.phone
    );
  } catch (error) {
    console.error('Erro no checkout:', error);
    alert('Erro ao processar checkout. Tente novamente.');
  }
};
```

### Configuração

Certifique-se de que as variáveis de ambiente estão configuradas:

```env
NEXT_PUBLIC_CORPORATE_ID=9
NEXT_PUBLIC_PROJECT_ID=6
NEXT_PUBLIC_DOTFLOW_API_URL=http://localhost:3001/api/gateway
NEXT_PUBLIC_DOTFLOW_API_KEY=df_test_key_123456789
NEXT_PUBLIC_DOTFLOW_CHECKOUT=https://localhost:3000/checkout
```

## Estrutura dos Dados

### Order (Pedido)
Baseado nos exemplos dos arquivos JSON fornecidos:
- `id`: ID único do pedido
- `order_number`: Número do pedido (ex: "PED-000001")
- `customer_id`: ID do cliente (pode ser null)
- `corporate_id`: ID da empresa (9)
- `project_id`: ID do projeto (6)
- `source`: Origem do pedido ("whatsapp", "ecommerce", etc.)
- `status`: Status do pedido ("completed", "pending", etc.)
- `total_amount`: Valor total
- `payment_method`: Método de pagamento
- `payment_status`: Status do pagamento

### Order Items (Itens do Pedido)
- `product_id`: ID do produto
- `quantity`: Quantidade
- `unit_price`: Preço unitário
- `total_price`: Preço total
- `discount_amount`: Valor do desconto
- `notes`: Observações do item
- `metadata`: Metadados em JSON com informações do produto

## Benefícios

1. **Separação de responsabilidades**: O e-commerce foca na experiência de compra, o checkout externo foca no pagamento
2. **Reutilização**: O mesmo checkout pode ser usado por múltiplos e-commerces
3. **Manutenção**: Atualizações de pagamento não afetam o e-commerce
4. **Segurança**: Dados de pagamento ficam isolados no sistema externo
5. **Flexibilidade**: Fácil integração com diferentes gateways de pagamento

## Próximos Passos

1. Configurar a página externa de checkout em `https://localhost:3001/checkout`
2. Implementar o processamento dos parâmetros na página externa
3. Configurar webhook para atualizar status do pedido após pagamento
4. Testar o fluxo completo de checkout
