# Modelo Simplificado para Criação de Pedidos via Ecommerce

## Resumo do Modelo

### Objetivo
Simplificar o fluxo de criação de pedidos vindos do ecommerce, utilizando apenas o **telefone** como identificador do cliente na tabela `customer_data`.

### Contexto Importante
**Este projeto serve como backend para sistemas externos de ecommerce e delivery.** O endpoint será acessado por aplicações externas, portanto deve incluir:
- Autenticação via API Key (header `x-api-key`)
- Validação de origem (se necessário)
- Tratamento robusto de erros
- Logs para auditoria

### Fluxo Proposto

1. **Receber dados do ecommerce** contendo:
   - Telefone do cliente (obrigatório)
   - Nome do cliente (obrigatório)
   - Dados do pedido (itens, valores, etc.)
   - `corporate_id` (ID da empresa)

2. **Identificar ou criar cliente**:
   - Buscar cliente na tabela `customer_data` pelo telefone + `corporate_id`
   - Se não existir, criar novo registro em `customer_data`
   - Retornar o `customer_id` obtido

3. **Criar pedido**:
   - Usar o `customer_id` obtido para criar o pedido na tabela `orders`
   - Criar os `order_items` associados

### Estrutura das Tabelas

#### `customer_data`
- `id` (integer, PK, auto-increment)
- `phone` (varchar) - **Campo chave para identificação**
- `name` (varchar)
- `corporate_id` (integer) - **Filtro adicional para busca**
- `address` (text, opcional)
- `document` (varchar, opcional)
- `ai_service` (boolean, default: false)
- `created_at` (timestamp)

#### `orders`
- `id` (integer, PK)
- `order_number` (text, unique)
- `customer_id` (integer, FK → customer_data.id) - **Campo obrigatório**
- `corporate_id` (integer, FK → corporate.id)
- `source` (text) - Ex: 'ecommerce'
- `status` (text)
- `total_amount` (numeric)
- `subtotal` (numeric)
- `tax_amount` (numeric)
- `discount_amount` (numeric)
- `shipping_amount` (numeric)
- `payment_method` (text)
- `payment_status` (text)
- `delivery_address` (jsonb)
- `billing_address` (jsonb)
- `metadata` (jsonb)
- `notes` (text)

### Endpoint Proposto

**POST** `/api/orders/create-from-ecommerce`

**Headers obrigatórios:**
- `Content-Type: application/json`
- `x-api-key: <API_KEY>` - Chave de API para autenticação (validar contra tabela `api_keys`)

**Request Body:**
```json
{
  "phone": "11999999999",
  "customer_name": "João Silva",
  "corporate_id": 12,
  "items": [
    {
      "product_id": 123,
      "quantity": 2,
      "unit_price": 25.50
    }
  ],
  "total_amount": 51.00,
  "subtotal": 51.00,
  "payment_method": "credit_card",
  "delivery_address": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "metadata": {
    "source": "ecommerce",
    "checkout_session_id": "cs_xxx"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "ORD-2024-001234",
  "customer_id": 456,
  "customer_created": false,
  "order": { ... }
}
```

### Vantagens do Modelo Simplificado

1. **Simplicidade**: Apenas telefone necessário para identificar cliente
2. **Flexibilidade**: Cliente pode ser criado automaticamente se não existir
3. **Consistência**: Mesma lógica de busca/criação para todos os pedidos
4. **Menos dependências**: Não precisa de autenticação prévia do cliente

### Observações Importantes

- O telefone deve ser normalizado (remover caracteres especiais) antes da busca
- A busca deve considerar `corporate_id` para evitar conflitos entre empresas
- Se o cliente já existir, apenas o nome pode ser atualizado se necessário
- O `customer_id` retornado deve ser usado para criar o pedido

### Segurança e Autenticação

Como este endpoint será usado por sistemas externos (ecommerce/delivery):

1. **Autenticação via API Key**:
   - Validar header `x-api-key` contra tabela `api_keys`
   - Verificar se a API key está ativa (`is_active = true`)
   - Validar se a API key tem permissão para criar pedidos
   - Associar o `corporate_id` da API key ao pedido (se não fornecido no body)

2. **Validação de Dados**:
   - Validar todos os campos obrigatórios
   - Sanitizar inputs para prevenir SQL injection
   - Validar formatos (telefone, valores numéricos, etc.)

3. **Logs e Auditoria**:
   - Registrar todas as requisições (sucesso e erro)
   - Incluir IP de origem nos logs
   - Registrar qual API key foi usada

4. **Rate Limiting** (recomendado):
   - Implementar limite de requisições por API key
   - Prevenir abuso e sobrecarga do sistema

