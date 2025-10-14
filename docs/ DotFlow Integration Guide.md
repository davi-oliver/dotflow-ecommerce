# 🚀 DotFlow Integration Guide

## 📋 Visão Geral
Este guia contém todas as informações necessárias para integrar projetos externos (E-commerce, Cardápio Digital, WhatsApp Agent) com o DotFlow.

## 🔑 Configuração da API

### Base URL
```
https://seu-dominio.com/api/gateway
```

### Autenticação
```bash
# Header obrigatório em todas as requisições
x-api-key: sua_api_key_aqui
```

### Endpoints Disponíveis

#### 📦 Produtos
```bash
# Listar produtos
GET /api/gateway?resource=products&action=list

# Criar produto
POST /api/gateway?resource=products&action=create
{
  "name": "Nome do Produto",
  "description": "Descrição",
  "sku": "SKU-001",
  "price": 99.99,
  "ammount_stock": 10
}
```

#### 👥 Clientes
```bash
# Listar clientes
GET /api/gateway?resource=customers&action=list

# Criar cliente
POST /api/gateway?resource=customers&action=create
{
  "name": "Nome do Cliente",
  "email": "cliente@email.com",
  "phone": "11999999999"
}
```

#### 📊 Analytics
```bash
# Dados de vendas
GET /api/gateway?resource=analytics&action=sales
```

## 🏗️ Estrutura de Projeto Recomendada

### E-commerce
```
dotflow-ecommerce/
├── src/
│   ├── lib/
│   │   └── dotflow-api.ts    # Cliente da API
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── Checkout.tsx
│   └── pages/
│       ├── products/
│       ├── cart/
│       └── checkout/
├── .env.local
└── package.json
```

### Cardápio Digital
```
dotflow-menu/
├── src/
│   ├── lib/
│   │   └── dotflow-api.ts
│   ├── components/
│   │   ├── MenuItem.tsx
│   │   ├── CategoryList.tsx
│   │   └── OrderSummary.tsx
│   └── pages/
│       ├── menu/
│       ├── cart/
│       └── order/
├── .env.local
└── package.json
```

## 🔧 Cliente API TypeScript

```typescript
// lib/dotflow-api.ts
export class DotFlowAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DOTFLOW_API_URL || 'http://localhost:3000/api/gateway';
    this.apiKey = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Produtos
  async getProducts() {
    return this.request('?resource=products&action=list');
  }

  async createProduct(product: any) {
    return this.request('?resource=products&action=create', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Clientes
  async getCustomers() {
    return this.request('?resource=customers&action=list');
  }

  async createCustomer(customer: any) {
    return this.request('?resource=customers&action=create', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Analytics
  async getSalesAnalytics() {
    return this.request('?resource=analytics&action=sales');
  }
}

export const dotflowAPI = new DotFlowAPI();
```

## 📝 Variáveis de Ambiente

### .env.local
```bash
# DotFlow API
NEXT_PUBLIC_DOTFLOW_API_URL=http://localhost:3000/api/gateway
NEXT_PUBLIC_DOTFLOW_API_KEY=sua_api_key_aqui

# Outras configurações específicas do projeto
NEXT_PUBLIC_APP_NAME=E-commerce
NEXT_PUBLIC_APP_DESCRIPTION=Loja online integrada ao DotFlow
```

## 🎯 Checklist de Integração

### ✅ Configuração Inicial
- [ ] Criar projeto Next.js/React
- [ ] Configurar variáveis de ambiente
- [ ] Implementar cliente API
- [ ] Testar conexão com DotFlow

### ✅ Funcionalidades Core
- [ ] Listagem de produtos
- [ ] Detalhes do produto
- [ ] Carrinho de compras
- [ ] Checkout
- [ ] Gestão de clientes

### ✅ Integrações Avançadas
- [ ] Webhooks para atualizações
- [ ] Sincronização em tempo real
- [ ] Analytics e relatórios
- [ ] Sistema de notificações

## 🔄 Fluxo de Desenvolvimento

1. **Setup**: Configurar projeto e API
2. **Core**: Implementar funcionalidades básicas
3. **UI/UX**: Desenvolver interface
4. **Testes**: Validar integração
5. **Deploy**: Publicar e monitorar

## 📞 Suporte

Para dúvidas sobre integração:
- Consulte este guia
- Verifique os logs da API Gateway
- Teste endpoints via curl/Postman
- Consulte a documentação do DotFlow

---

**Última atualização**: 30/08/2025
**Versão**: 1.0.0 