# Exemplo de Payload Completo - Endpoint create-from-ecommerce

## 📋 Endpoint

**POST** `/api/orders/create-from-ecommerce`

**URL Completa:**
```
http://localhost:3000/api/orders/create-from-ecommerce
```

**Headers:**
```http
Content-Type: application/json
x-api-key: sua-api-key-aqui (opcional, usa appConfig.apiKey se não fornecido)
```

---

## 🔑 Campos Obrigatórios

- `phone` (string) - Telefone do cliente (será normalizado)
- `customer_name` (string) - Nome do cliente
- `items` (array) - Array de itens do pedido (não vazio)
- `total_amount` (number) - Valor total do pedido
- `subtotal` (number) - Subtotal do pedido
- `payment_method` (string) - Método de pagamento

---

## 📦 Exemplo 1 - Pedido Simples (Sem Token)

```json
{
  "phone": "(11) 99999-9999",
  "customer_name": "João Silva",
  "corporate_id": 12,
  "items": [
    {
      "product_id": 123,
      "quantity": 2,
      "unit_price": 25.50,
      "discount_amount": 0,
      "notes": null,
      "metadata": {
        "product_name": "Pizza Calabresa",
        "product_sku": "PIZ-CAL-001"
      }
    },
    {
      "product_id": 45,
      "quantity": 1,
      "unit_price": 8.50,
      "discount_amount": 0,
      "metadata": {
        "product_name": "Refrigerante Coca-Cola 2L",
        "product_sku": "BEB-COC-2L"
      }
    }
  ],
  "total_amount": 59.50,
  "subtotal": 59.50,
  "tax_amount": 0,
  "discount_amount": 0,
  "shipping_amount": 0,
  "payment_method": "credit_card",
  "payment_status": "pending",
  "status": "pending_payment",
  "source": "ecommerce",
  "notes": "Entregar após 18h"
}
```

---

## 🔑 Exemplo 2 - Pedido com Token (Cliente do WhatsApp)

```json
{
  "phone": "11999999999",
  "customer_name": "Maria Santos",
  "token": "64dec0710d4762ec9d9432a18f8f761a5b38cc15aae937406799e4d6ba4a05e6",
  "ref": "ref_miad0xo9_c6e54530",
  "corporate_id": 12,
  "items": [
    {
      "product_id": 78,
      "quantity": 1,
      "unit_price": 89.90,
      "discount_amount": 0,
      "metadata": {
        "product_name": "Pizza Grande Meio a Meio",
        "pizza_size": "Grande",
        "pizza_flavors": "Calabresa,Portuguesa",
        "pizza_border": "Catupiry"
      }
    }
  ],
  "total_amount": 89.90,
  "subtotal": 89.90,
  "tax_amount": 0,
  "discount_amount": 0,
  "shipping_amount": 0,
  "payment_method": "pix",
  "payment_status": "pending",
  "status": "pending_payment",
  "source": "ecommerce",
  "delivery_address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  },
  "metadata": {
    "source": "ecommerce",
    "whatsapp_link": true,
    "coupon_code": null
  }
}
```

---

## 🍕 Exemplo 3 - Pedido com Pizza Customizada

```json
{
  "phone": "5511999999999",
  "customer_name": "Pedro Oliveira",
  "corporate_id": 12,
  "items": [
    {
      "product_id": null,
      "quantity": 1,
      "unit_price": 95.00,
      "discount_amount": 5.00,
      "notes": "Sem cebola",
      "metadata": {
        "product_name": "Pizza Grande Personalizada",
        "pizza_size": "Grande",
        "pizza_flavors": "Frango com Catupiry,Quatro Queijos",
        "pizza_border": "Cheddar",
        "pizza_extras": ["Bacon extra", "Azeitona"],
        "custom_instructions": "Sem cebola, bem assada"
      }
    },
    {
      "product_id": 45,
      "quantity": 2,
      "unit_price": 8.50,
      "discount_amount": 0,
      "metadata": {
        "product_name": "Refrigerante Coca-Cola 2L"
      }
    }
  ],
  "total_amount": 112.00,
  "subtotal": 112.00,
  "tax_amount": 0,
  "discount_amount": 5.00,
  "shipping_amount": 15.90,
  "payment_method": "credit_card",
  "payment_status": "pending",
  "status": "pending_payment",
  "source": "ecommerce",
  "delivery_address": {
    "street": "Av. Paulista",
    "number": "1000",
    "complement": "Sala 10",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100"
  },
  "billing_address": {
    "street": "Av. Paulista",
    "number": "1000",
    "complement": "Sala 10",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100"
  },
  "metadata": {
    "source": "ecommerce",
    "platform": "dotflow-ecommerce",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  },
  "notes": "Cliente solicitou entrega rápida"
}
```

---

## 🎁 Exemplo 4 - Pedido com Cupom de Desconto

```json
{
  "phone": "(11) 88888-8888",
  "customer_name": "Ana Costa",
  "corporate_id": 12,
  "items": [
    {
      "product_id": 100,
      "quantity": 1,
      "unit_price": 89.90,
      "discount_amount": 0,
      "metadata": {
        "product_name": "Combo Família"
      }
    },
    {
      "product_id": 45,
      "quantity": 2,
      "unit_price": 8.50,
      "discount_amount": 0,
      "metadata": {
        "product_name": "Refrigerante Coca-Cola 2L"
      }
    }
  ],
  "total_amount": 96.40,
  "subtotal": 106.90,
  "tax_amount": 0,
  "discount_amount": 10.50,
  "shipping_amount": 0,
  "payment_method": "credit_card",
  "payment_status": "pending",
  "status": "pending_payment",
  "source": "ecommerce",
  "metadata": {
    "source": "ecommerce",
    "coupon_code": "DESCONTO10",
    "coupon_discount": 10.50,
    "coupon_type": "percentage"
  },
  "notes": "Cupom DESCONTO10 aplicado"
}
```

---

## 📱 Exemplo 5 - Pedido Mínimo (Apenas Campos Obrigatórios)

```json
{
  "phone": "11999999999",
  "customer_name": "Cliente Teste",
  "items": [
    {
      "product_id": 123,
      "quantity": 1,
      "unit_price": 25.50
    }
  ],
  "total_amount": 25.50,
  "subtotal": 25.50,
  "payment_method": "pix"
}
```

---

## 🔄 Response de Sucesso (200 OK)

```json
{
  "success": true,
  "order_id": "12-20240115120000-1234",
  "customer_id": 123,
  "customer_created": false,
  "order": {
    "id": 789,
    "order_number": "12-20240115120000-1234",
    "customer_id": 123,
    "corporate_id": 12,
    "source": "ecommerce",
    "status": "pending_payment",
    "payment_status": "pending",
    "total_amount": 59.50,
    "subtotal": 59.50,
    "tax_amount": 0,
    "discount_amount": 0,
    "shipping_amount": 0,
    "payment_method": "credit_card",
    "delivery_address": null,
    "billing_address": null,
    "metadata": {
      "source": "ecommerce"
    },
    "notes": "Entregar após 18h",
    "created_at": "2024-01-15T12:00:00.000Z",
    "order_items": [
      {
        "id": 1001,
        "order_id": 789,
        "product_id": 123,
        "quantity": 2,
        "unit_price": 25.50,
        "total_price": 51.00,
        "discount_amount": 0,
        "notes": null,
        "metadata": {
          "product_name": "Pizza Calabresa",
          "product_sku": "PIZ-CAL-001"
        }
      },
      {
        "id": 1002,
        "order_id": 789,
        "product_id": 45,
        "quantity": 1,
        "unit_price": 8.50,
        "total_price": 8.50,
        "discount_amount": 0,
        "notes": null,
        "metadata": {
          "product_name": "Refrigerante Coca-Cola 2L",
          "product_sku": "BEB-COC-2L"
        }
      }
    ]
  }
}
```

---

## ❌ Response de Erro

### 400 Bad Request - Validação Falhou
```json
{
  "success": false,
  "error": "phone é obrigatório e deve ser uma string não vazia"
}
```

### 401 Unauthorized - Token Inválido
```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Erro ao criar pedido na API externa"
}
```

---

## 📝 Estrutura dos Itens

Cada item no array `items` deve ter:

```typescript
{
  product_id?: number | null,      // ID do produto (opcional, pode ser null para itens customizados)
  quantity: number,                 // Quantidade (obrigatório, > 0)
  unit_price: number,               // Preço unitário (obrigatório, >= 0)
  discount_amount?: number,         // Desconto do item (opcional, padrão: 0)
  notes?: string | null,           // Observações do item (opcional)
  metadata?: {                      // Metadados do item (opcional)
    product_name?: string,          // Nome do produto
    product_sku?: string,           // SKU do produto
    pizza_size?: string,            // Tamanho da pizza
    pizza_flavors?: string,         // Sabores (para meio a meio)
    pizza_border?: string,          // Tipo de borda
    [key: string]: unknown          // Outros campos personalizados
  }
}
```

---

## 🔐 Campos Opcionais Importantes

### Token e Referência
- `token` (string, opcional) - Token do delivery link para identificar cliente
- `ref` (string, opcional) - Referência alternativa ao token

### Endereços
- `delivery_address` (object, opcional) - Endereço de entrega
- `billing_address` (object, opcional) - Endereço de cobrança

### Metadados
- `metadata` (object, opcional) - Metadados adicionais do pedido
- `source` (string, opcional) - Origem do pedido (padrão: "ecommerce")
- `notes` (string, opcional) - Observações gerais do pedido

### Valores
- `tax_amount` (number, opcional) - Valor de impostos (padrão: 0)
- `discount_amount` (number, opcional) - Valor total de desconto (padrão: 0)
- `shipping_amount` (number, opcional) - Valor do frete (padrão: 0)
- `payment_status` (string, opcional) - Status do pagamento (padrão: "pending")
- `status` (string, opcional) - Status do pedido (padrão: "pending_payment")

---

## 🧪 Exemplo de Requisição cURL

### Com Token (Cliente do WhatsApp)
```bash
curl -X POST http://localhost:3000/api/orders/create-from-ecommerce \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-api-key-aqui" \
  -d '{
    "phone": "11999999999",
    "customer_name": "João Silva",
    "token": "64dec0710d4762ec9d9432a18f8f761a5b38cc15aae937406799e4d6ba4a05e6",
    "corporate_id": 12,
    "items": [
      {
        "product_id": 123,
        "quantity": 2,
        "unit_price": 25.50,
        "metadata": {
          "product_name": "Pizza Calabresa"
        }
      }
    ],
    "total_amount": 51.00,
    "subtotal": 51.00,
    "payment_method": "credit_card"
  }'
```

### Sem Token (Cliente Direto)
```bash
curl -X POST http://localhost:3000/api/orders/create-from-ecommerce \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-api-key-aqui" \
  -d '{
    "phone": "(11) 99999-9999",
    "customer_name": "Maria Santos",
    "corporate_id": 12,
    "items": [
      {
        "product_id": 45,
        "quantity": 1,
        "unit_price": 8.50,
        "metadata": {
          "product_name": "Refrigerante"
        }
      }
    ],
    "total_amount": 8.50,
    "subtotal": 8.50,
    "payment_method": "pix",
    "delivery_address": {
      "street": "Rua Exemplo",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01234-567"
    }
  }'
```

---

## 📌 Observações Importantes

1. **Telefone**: Aceita qualquer formato, será normalizado automaticamente
   - `(11) 99999-9999` → `11999999999`
   - `+55 11 99999-9999` → `5511999999999`
   - `11999999999@s.whatsapp.net` → `11999999999`

2. **Token**: Se fornecido, identifica cliente automaticamente (mais rápido)
   - Se não fornecido, busca/cria cliente por telefone

3. **Product ID**: Pode ser `null` para itens customizados (ex: pizzas personalizadas)

4. **Valores**: Todos em reais (não centavos)

5. **Metadata**: Use para informações adicionais dos itens (tamanho, sabores, etc.)

6. **Endereços**: Opcionais, mas recomendados para pedidos de entrega

---

## 🔄 Fluxo de Processamento

1. **Validação**: Valida campos obrigatórios
2. **Normalização**: Normaliza telefone (remove caracteres não numéricos e sufixo WhatsApp)
3. **Identificação do Cliente**:
   - Se `token` fornecido → Busca cliente via token
   - Se não → Busca/cria cliente por telefone
4. **Criação do Pedido**: Envia para API externa `/api/orders/create`
5. **Resposta**: Retorna dados completos do pedido criado

