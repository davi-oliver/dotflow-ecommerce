# Script de Implementação - API de Criação de Pedidos para Ecommerce

## ⚠️ CONTEXTO CRÍTICO

**Este documento é para implementar a API NESTE PROJETO (dotSas).**

O projeto de ecommerce/delivery **NÃO precisa criar backend próprio**. Eles apenas fazem chamadas HTTP para esta API.

**Este projeto serve como backend completo para sistemas externos.**

---

## Script para o Chat de IA

```
Preciso implementar um endpoint de API REST para criação de pedidos que será usado por sistemas externos de ecommerce e delivery.

CONTEXTO CRÍTICO:
- Este projeto (dotSas) É O BACKEND COMPLETO
- Sistemas externos (ecommerce/delivery) apenas fazem chamadas HTTP
- NÃO há necessidade de código server-side nos projetos externos
- Toda lógica de negócio deve estar neste endpoint
- O endpoint deve ser acessível externamente via HTTP

CONTEXTO TÉCNICO:
- Projeto Next.js com Supabase
- Endpoints da API em /app/api/*
- Tabela `customer_data`: id, phone, name, corporate_id, address, document, ai_service, created_at
- Tabela `orders`: id, order_number, customer_id, corporate_id, source, status, total_amount, subtotal, tax_amount, discount_amount, shipping_amount, payment_method, payment_status, delivery_address, billing_address, metadata, notes
- Tabela `order_items`: id, order_id, product_id, quantity, unit_price, total_price, discount_amount, notes, metadata
- Tabela `api_keys`: id, key, name, corporate_id, permissions, is_active, rate_limit, last_used
- Função `generateOrderNumber` em @/lib/order-numbering
- Função `createAdminClient` em @/utils/supabase/admin

REQUISITOS DE IMPLEMENTAÇÃO:

1. CRIAR ENDPOINT: POST /app/api/orders/create-from-ecommerce/route.ts

2. AUTENTICAÇÃO (PRIMEIRA COISA A FAZER):
   - Ler header `x-api-key` da requisição
   - Buscar na tabela `api_keys` onde key = x-api-key
   - Verificar se existe e is_active = true
   - Se não existir ou inativa: retornar 401 Unauthorized
   - Se corporate_id não fornecido no body, usar corporate_id da API key
   - Atualizar last_used da API key

3. VALIDAÇÃO DE DADOS:
   - phone: obrigatório, string (será normalizado)
   - customer_name: obrigatório, string não vazia
   - corporate_id: obrigatório (pode vir da API key)
   - items: obrigatório, array não vazio
   - total_amount: obrigatório, número > 0
   - subtotal: obrigatório, número > 0
   - payment_method: obrigatório, string
   - Retornar 400 Bad Request se validações falharem

4. NORMALIZAÇÃO DE TELEFONE:
   - Criar função que remove todos caracteres não numéricos
   - Exemplo: "(11) 99999-9999" → "11999999999"
   - Exemplo: "+55 11 99999-9999" → "5511999999999"
   - Usar telefone normalizado para todas as operações

5. LÓGICA DE CLIENTE (customer_data):
   - Normalizar telefone recebido
   - Buscar em customer_data: WHERE phone = normalized_phone AND corporate_id = corporate_id
   - SE ENCONTRAR:
     - Usar customer_id existente
     - Se name diferente, atualizar name
   - SE NÃO ENCONTRAR:
     - Criar novo registro: name, phone (normalizado), corporate_id
     - Usar customer_id retornado
   - Retornar customer_id para usar no pedido

6. CRIAÇÃO DO PEDIDO (orders):
   - Gerar order_number usando: generateOrderNumber({ corporateId, companyName })
   - Criar registro em orders com:
     - order_number: gerado
     - customer_id: obtido da lógica acima
     - corporate_id: do body ou da API key
     - source: 'ecommerce' (ou metadata.source se fornecido)
     - status: 'pending_payment' (ou do body)
     - payment_status: 'pending' (ou do body)
     - total_amount: do body
     - subtotal: do body
     - tax_amount: do body (ou 0)
     - discount_amount: do body (ou 0)
     - shipping_amount: do body (ou 0)
     - payment_method: do body
     - delivery_address: do body (se fornecido, converter para JSONB)
     - billing_address: do body (se fornecido, converter para JSONB)
     - metadata: do body (se fornecido, converter para JSONB)
     - notes: do body (se fornecido)

7. CRIAÇÃO DOS ITENS (order_items):
   - Para cada item no array items:
     - product_id: item.product_id (pode ser null)
     - quantity: item.quantity
     - unit_price: item.unit_price
     - total_price: unit_price * quantity
     - discount_amount: item.discount_amount (ou 0)
     - notes: item.notes (ou null)
     - metadata: item.metadata (ou {})
     - order_id: id do pedido criado
   - Inserir todos os order_items em batch

8. RESPOSTA DE SUCESSO:
   - Retornar 200 OK
   - Body JSON com:
     {
       "success": true,
       "order_id": order_number,
       "customer_id": customer_id,
       "customer_created": boolean (se cliente foi criado),
       "order": { dados completos do pedido }
     }

9. TRATAMENTO DE ERROS:
   - 400 Bad Request: validações falharam
   - 401 Unauthorized: API key inválida/inativa
   - 500 Internal Server Error: erro no banco ou processamento
   - Sempre retornar JSON com campo "error" e mensagem descritiva

10. CORS E HEADERS:
    - Headers CORS: Access-Control-Allow-Origin: '*'
    - Headers permitidos: Content-Type, x-api-key
    - Método OPTIONS: retornar 200 com headers CORS
    - Adicionar headers em todas as respostas

11. LOGS E AUDITORIA:
    - Logar início da requisição (IP, API key, dados recebidos)
    - Logar sucesso (order_id criado)
    - Logar erros (tipo de erro, mensagem)
    - Usar console.log para desenvolvimento

12. ESTRUTURA DO CÓDIGO:
    - TypeScript
    - Usar createAdminClient() para todas operações de banco
    - Seguir padrão dos outros endpoints em /app/api/*
    - Funções auxiliares bem definidas
    - Código limpo e comentado

13. EXEMPLO DE REQUEST BODY ESPERADO:
{
  "phone": "11999999999",
  "customer_name": "João Silva",
  "corporate_id": 12,
  "items": [
    {
      "product_id": 123,
      "quantity": 2,
      "unit_price": 25.50,
      "notes": "Observações (opcional)"
    }
  ],
  "total_amount": 51.00,
  "subtotal": 51.00,
  "tax_amount": 0,
  "discount_amount": 0,
  "shipping_amount": 0,
  "payment_method": "credit_card",
  "payment_status": "pending",
  "delivery_address": { ... },
  "metadata": { "source": "ecommerce" },
  "notes": "Observações do pedido"
}

IMPLEMENTE O ENDPOINT COMPLETO SEGUINDO TODOS OS REQUISITOS ACIMA.
```

---

## Checklist de Implementação

Após receber o código do chat, verifique:

### Estrutura Básica
- [ ] Arquivo criado em `/app/api/orders/create-from-ecommerce/route.ts`
- [ ] Exporta função `POST` e `OPTIONS`
- [ ] Headers CORS configurados corretamente

### Autenticação
- [ ] Validação de `x-api-key` no início
- [ ] Busca na tabela `api_keys`
- [ ] Verificação de `is_active`
- [ ] Retorno 401 se inválida
- [ ] Atualização de `last_used`

### Validações
- [ ] Validação de todos os campos obrigatórios
- [ ] Validação de tipos de dados
- [ ] Validação de valores (números > 0, arrays não vazios)
- [ ] Retorno 400 com mensagem clara em caso de erro

### Normalização
- [ ] Função de normalização de telefone
- [ ] Telefone normalizado usado em todas operações

### Lógica de Cliente
- [ ] Busca por telefone + corporate_id
- [ ] Criação se não existir
- [ ] Atualização de nome se existir
- [ ] customer_id obtido corretamente

### Criação de Pedido
- [ ] Geração de order_number
- [ ] Inserção na tabela orders
- [ ] Todos os campos preenchidos corretamente
- [ ] Conversão de objetos para JSONB (delivery_address, metadata)

### Criação de Itens
- [ ] Loop através do array items
- [ ] Cálculo de total_price
- [ ] Inserção em batch na tabela order_items
- [ ] Associação correta com order_id

### Resposta
- [ ] Status 200 em caso de sucesso
- [ ] JSON com estrutura correta
- [ ] Inclusão de customer_created
- [ ] Dados completos do pedido retornados

### Erros
- [ ] Tratamento de todos os tipos de erro
- [ ] Status codes corretos (400, 401, 500)
- [ ] Mensagens de erro descritivas
- [ ] Try/catch adequado

### CORS
- [ ] Método OPTIONS implementado
- [ ] Headers CORS em todas respostas
- [ ] Headers permitidos configurados

### Logs
- [ ] Logs de início de requisição
- [ ] Logs de sucesso
- [ ] Logs de erros
- [ ] Informações úteis para debug

---

## Teste do Endpoint

### 1. Criar API Key de Teste

```sql
INSERT INTO api_keys (key, name, corporate_id, is_active, permissions)
VALUES ('test-ecommerce-key-123', 'Test Ecommerce API', 12, true, '["create_orders"]');
```

### 2. Testar com cURL

```bash
curl -X POST http://localhost:3000/api/orders/create-from-ecommerce \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-ecommerce-key-123" \
  -d '{
    "phone": "(11) 99999-9999",
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
    "payment_method": "credit_card"
  }'
```

### 3. Testar Sem API Key (deve retornar 401)

```bash
curl -X POST http://localhost:3000/api/orders/create-from-ecommerce \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "11999999999",
    "customer_name": "Teste"
  }'
```

### 4. Testar Validações (deve retornar 400)

```bash
curl -X POST http://localhost:3000/api/orders/create-from-ecommerce \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-ecommerce-key-123" \
  -d '{
    "phone": "",
    "customer_name": "Teste"
  }'
```

---

## Documentação para Desenvolvedores Externos

Após implementação, criar documentação simples explicando:

1. **URL do Endpoint**: `https://seu-dominio.com/api/orders/create-from-ecommerce`
2. **Método**: POST
3. **Autenticação**: Header `x-api-key`
4. **Request Body**: Estrutura JSON completa
5. **Response**: Estrutura de sucesso e erros
6. **Exemplos de código**: JavaScript, PHP, Python

**Lembrar**: Eles só precisam fazer uma chamada HTTP, nada mais!

---

## Próximos Passos

1. ✅ Implementar endpoint seguindo script acima
2. ✅ Testar localmente
3. ✅ Criar API keys para sistemas externos
4. ✅ Documentar endpoint para desenvolvedores
5. ✅ Fazer deploy em produção
6. ✅ Monitorar logs e performance
7. ⚠️ Considerar rate limiting por API key
8. ⚠️ Implementar webhooks para notificações (opcional)

---

## Notas Importantes

- **Este endpoint é público** (acessível externamente)
- **Autenticação é obrigatória** (API key)
- **Toda lógica está aqui** (não nos projetos externos)
- **Projetos externos são apenas clientes HTTP** (não precisam de backend)
