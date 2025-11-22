# Exemplo de Payload Completo - Criação de Pedido via Ecommerce

## 📋 Endpoint

**POST** `/api/orders/create`

**URL Completa:**
```
https://seu-dominio.com/api/orders/create
```

**Headers:**
```http
Content-Type: application/json
x-api-key: <SUA_API_KEY> (opcional)
```

---

## 🔑 Campos Obrigatórios

- `customer_id` (integer) - ID do cliente na tabela `customer_data`
- `company_id` (integer) - ID da empresa/corporate
- `amount` (number) - Valor total do pedido em reais
- `description` (string) - Descrição do pedido
- `payment_method` (string) - Método de pagamento

---

## 📦 Exemplo Completo - Pedido Simples com Produtos

```json
{
  "customer_id": 123,
  "company_id": 12,
  "amount": 125.50,
  "currency": "brl",
  "status": "pending_payment",
  "payment_method": "credit_card",
  "description": "Pedido do ecommerce - Cliente João Silva",
  "notes": "Entregar após 18h",
  "metadata": {
    "source": "ecommerce",
    "checkout_session_id": "cs_abc123xyz",
    "order_reference": "ECOMM-2024-001",
    
    // Produto 1 - Refrigerante
    "product_id_0": 45,
    "product_price_0": 8.50,
    "product_qty_0": 2,
    "item_0": "Refrigerante Coca-Cola 2L",
    
    // Produto 2 - Hambúrguer
    "product_id_1": 78,
    "product_price_1": 32.90,
    "product_qty_1": 1,
    "item_1": "Hambúrguer Artesanal",
    
    // Produto 3 - Batata Frita
    "product_id_2": 92,
    "product_price_2": 15.00,
    "product_qty_2": 2,
    "item_2": "Batata Frita Grande",
    
    // Endereço de entrega
    "delivery_address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "reference": "Próximo ao mercado"
    }
  }
}
```

---

## 🍕 Exemplo - Pedido com Pizza

```json
{
  "customer_id": 123,
  "company_id": 12,
  "amount": 89.90,
  "currency": "brl",
  "status": "pending_payment",
  "payment_method": "pix",
  "description": "Pedido de Pizza - Meio a Meio",
  "metadata": {
    "source": "ecommerce",
    
    // Pizza Meio a Meio
    "pizza_size_0": "Grande",
    "pizza_flavors_0": "Calabresa,Portuguesa",
    "product_price_0": 89.90,
    "product_qty_0": 1,
    "pizza_border_0": "Catupiry",
    "pizza_type_0": "half_and_half",
    "pizza_category_0": "Tradicional",
    "item_0": "Pizza Grande 1/2 Calabresa x 1/2 Portuguesa com borda Catupiry",
    
    // Bebida adicional
    "product_id_1": 45,
    "product_price_1": 8.50,
    "product_qty_1": 1,
    "item_1": "Refrigerante Coca-Cola 2L",
    
    "delivery_address": {
      "street": "Av. Paulista",
      "number": "1000",
      "complement": "Sala 10",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100"
    }
  }
}
```

---

## 🎁 Exemplo - Pedido com Cupom de Desconto

```json
{
  "customer_id": 123,
  "company_id": 12,
  "amount": 113.50,
  "currency": "brl",
  "status": "pending_payment",
  "payment_method": "credit_card",
  "description": "Pedido com cupom DESCONTO10",
  "metadata": {
    "source": "ecommerce",
    
    // Cupom de desconto
    "meta_coupon_code": "DESCONTO10",
    "meta_coupon_type": "percentage",
    "meta_coupon_discount": "10",
    "meta_discount_amount": "12.50",
    "meta_cart_total": "126.00",
    
    // Produtos
    "product_id_0": 78,
    "product_price_0": 45.00,
    "product_qty_0": 2,
    "item_0": "Hambúrguer Premium",
    
    "product_id_1": 92,
    "product_price_0": 18.00,
    "product_qty_1": 2,
    "item_1": "Batata Frita Grande",
    
    "delivery_address": {
      "street": "Rua Exemplo",
      "number": "456",
      "neighborhood": "Jardim das Flores",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "02345-678"
    }
  }
}
```

---

## 🛒 Exemplo - Pedido Completo com Múltiplos Itens

```json
{
  "customer_id": 456,
  "company_id": 12,
  "amount": 245.80,
  "currency": "brl",
  "status": "pending_payment",
  "payment_method": "credit_card",
  "description": "Pedido completo - Ecommerce",
  "notes": "Cliente solicitou entrega rápida",
  "customer_info": {
    "name": "Maria Silva",
    "phone": "11999999999",
    "email": "maria@email.com"
  },
  "metadata": {
    "source": "ecommerce",
    "checkout_session_id": "cs_xyz789abc",
    "order_reference": "ECOMM-2024-002",
    "platform": "woocommerce",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    
    // Item 1 - Combo
    "item_0": "Combo Família",
    "product_id_0": 100,
    "product_price_0": 89.90,
    "product_qty_0": 1,
    "combo_type_0": "family",
    
    // Item 2 - Pizza
    "pizza_size_1": "Média",
    "pizza_flavor_1": "Margherita",
    "product_price_1": 45.00,
    "product_qty_1": 1,
    "pizza_border_1": "Cheddar",
    "item_1": "Pizza Média Margherita com borda Cheddar",
    
    // Item 3 - Bebida
    "product_id_2": 45,
    "product_price_2": 8.50,
    "product_qty_2": 3,
    "item_2": "Refrigerante Coca-Cola 2L",
    
    // Item 4 - Sobremesa
    "product_id_3": 120,
    "product_price_3": 12.40,
    "product_qty_3": 2,
    "item_3": "Sorvete de Chocolate",
    
    // Endereço de entrega completo
    "delivery_address": {
      "street": "Rua das Palmeiras",
      "number": "789",
      "complement": "Casa dos fundos",
      "neighborhood": "Vila Nova",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "03456-789",
      "reference": "Portão azul",
      "instructions": "Tocar a campainha 3 vezes"
    },
    
    // Endereço de cobrança (opcional)
    "billing_address": {
      "street": "Rua das Palmeiras",
      "number": "789",
      "complement": "Casa dos fundos",
      "neighborhood": "Vila Nova",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "03456-789"
    }
  }
}
```

---

## 📝 Formato dos Itens no Metadata

A API processa itens através do campo `metadata` usando índices numéricos:

### Para Produtos Simples:
```json
{
  "metadata": {
    "product_id_0": 123,        // ID do produto (obrigatório se produto existe)
    "product_price_0": 25.50,   // Preço unitário (obrigatório)
    "product_qty_0": 2,          // Quantidade (obrigatório)
    "item_0": "Nome do Produto"  // Nome/descrição (opcional)
  }
}
```

### Para Pizza:
```json
{
  "metadata": {
    "pizza_size_0": "Grande",                    // Tamanho
    "pizza_flavor_0": "Calabresa",               // Sabor único
    "pizza_flavors_0": "Calabresa,Portuguesa",   // Meio a meio
    "pizza_border_0": "Catupiry",                // Borda (opcional)
    "pizza_additional_0": "Bacon extra",          // Adicional (opcional)
    "product_price_0": 89.90,
    "product_qty_0": 1,
    "item_0": "Pizza Grande Calabresa"
  }
}
```

### Para Combos:
```json
{
  "metadata": {
    "item_0": "Combo Família",
    "product_id_0": 100,          // ID do combo (opcional)
    "product_price_0": 89.90,
    "product_qty_0": 1,
    "combo_type_0": "family"
  }
}
```

---

## 🔄 Response de Sucesso (200/201)

```json
{
  "success": true,
  "order_id": "ORD-2024-001234",
  "order": {
    "id": 789,
    "order_number": "ORD-2024-001234",
    "customer_id": 123,
    "corporate_id": 12,
    "source": "ecommerce",
    "status": "pending_payment",
    "total_amount": 125.50,
    "subtotal": 125.50,
    "discount_amount": 0,
    "payment_method": "credit_card",
    "payment_status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "transaction_id": "tx_1234567890",
  "status": "pending_payment",
  "amount": 125.50,
  "currency": "brl"
}
```

---

## ❌ Response de Erro

### 400 Bad Request
```json
{
  "error": "Missing required fields: customer_id, company_id, amount, description"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create order"
}
```

---

## 📌 Observações Importantes

1. **Valores em Reais**: Todos os valores monetários devem ser enviados em reais (não centavos)
2. **Índices dos Itens**: Use índices numéricos sequenciais (0, 1, 2, ...) para cada item
3. **Product ID**: Pode ser `null` se o item não tiver produto cadastrado (ex: pizzas customizadas)
4. **Metadata**: Todos os itens devem estar dentro do objeto `metadata`
5. **Delivery Address**: É opcional, mas recomendado para pedidos de entrega
6. **Cupom**: Se usar cupom, inclua todos os campos `meta_coupon_*` no metadata

---

## 🧪 Exemplo de Requisição cURL

```bash
curl -X POST https://seu-dominio.com/api/orders/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-api-key-aqui" \
  -d '{
    "customer_id": 123,
    "company_id": 12,
    "amount": 125.50,
    "payment_method": "credit_card",
    "description": "Pedido do ecommerce",
    "metadata": {
      "source": "ecommerce",
      "product_id_0": 45,
      "product_price_0": 8.50,
      "product_qty_0": 2,
      "item_0": "Refrigerante Coca-Cola 2L"
    }
  }'
```

---

## 📚 Campos Disponíveis

### Campos do Body Principal:
- `customer_id` (integer, obrigatório)
- `company_id` (integer, obrigatório)
- `amount` (number, obrigatório)
- `currency` (string, opcional, padrão: "brl")
- `status` (string, opcional, padrão: "pending_payment")
- `payment_method` (string, obrigatório)
- `description` (string, obrigatório)
- `notes` (string, opcional)
- `customer_info` (object, opcional)
- `items` (array, opcional - **não processado atualmente**)
- `metadata` (object, opcional mas necessário para itens)

### Campos do Metadata para Itens:
- `product_id_{index}` (integer, opcional)
- `product_price_{index}` (number, obrigatório)
- `product_qty_{index}` (integer, obrigatório)
- `item_{index}` (string, opcional)
- `pizza_size_{index}` (string, para pizzas)
- `pizza_flavor_{index}` (string, para pizzas)
- `pizza_flavors_{index}` (string, para pizzas meio a meio)
- `pizza_border_{index}` (string, opcional)
- `delivery_address` (object, opcional)
- `billing_address` (object, opcional)

### Campos do Metadata para Cupom:
- `meta_coupon_code` (string)
- `meta_coupon_type` (string: "percentage" ou "fixed")
- `meta_coupon_discount` (string/number)
- `meta_discount_amount` (string/number)
- `meta_cart_total` (string/number)

