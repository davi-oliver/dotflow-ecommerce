# Sistema de Autenticação para Clientes do E-commerce

## 🔐 **Visão Geral**

Este sistema permite que clientes do e-commerce tenham autenticação completa, mantendo sessões seguras e integração com o DotFlow.

## 📋 **Endpoints Disponíveis**

### **1. Registro de Cliente**
```http
POST /api/gateway?resource=auth&action=register
```

**Body:**
```json
{
  "email": "cliente@email.com",
  "password": "senha123",
  "name": "João Silva",
  "phone": "11987654321",
  "document": "12345678901",
  "document_type": "CPF"
}
```

**Resposta:**
```json
{
  "customer": {
    "id": 4,
    "name": "João Silva",
    "email": "cliente@email.com",
    "auth_user_id": "uuid-do-supabase",
    "company_id": 9,
    "status": "active"
  },
  "session": {
    "token": "cust_abc123...",
    "refresh_token": "ref_xyz789...",
    "expires_at": "2025-09-08T16:00:00.000Z"
  }
}
```

### **2. Login de Cliente**
```http
POST /api/gateway?resource=auth&action=login
```

**Body:**
```json
{
  "email": "cliente@email.com",
  "password": "senha123"
}
```

### **3. Logout de Cliente**
```http
POST /api/gateway?resource=auth&action=logout&token=cust_abc123...
```

### **4. Refresh Token**
```http
POST /api/gateway?resource=auth&action=refresh
```

**Body:**
```json
{
  "refresh_token": "ref_xyz789..."
}
```

### **5. Validar Token**
```http
GET /api/gateway?resource=auth&action=validate&token=cust_abc123...
```

## 🚀 **Como Usar no E-commerce**

### **1. Registro de Usuário**
```typescript
const registerCustomer = async (userData: any) => {
  const response = await fetch('http://localhost:3001/api/gateway?resource=auth&action=register', {
    method: 'POST',
    headers: {
      'x-api-key': 'df_test_key_123456789',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone,
      document: userData.document,
      document_type: 'CPF'
    })
  })
  
  const data = await response.json()
  
  // Salvar token no localStorage
  localStorage.setItem('customer_token', data.session.token)
  localStorage.setItem('customer_refresh_token', data.session.refresh_token)
  
  return data.customer
}
```

### **2. Login de Usuário**
```typescript
const loginCustomer = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/api/gateway?resource=auth&action=login', {
    method: 'POST',
    headers: {
      'x-api-key': 'df_test_key_123456789',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  
  const data = await response.json()
  
  // Salvar token no localStorage
  localStorage.setItem('customer_token', data.session.token)
  localStorage.setItem('customer_refresh_token', data.session.refresh_token)
  
  return data.customer
}
```

### **3. Verificar Autenticação**
```typescript
const validateCustomerSession = async () => {
  const token = localStorage.getItem('customer_token')
  
  if (!token) return null
  
  const response = await fetch(`http://localhost:3001/api/gateway?resource=auth&action=validate&token=${token}`, {
    headers: {
      'x-api-key': 'df_test_key_123456789'
    }
  })
  
  if (response.ok) {
    const data = await response.json()
    return data.customer
  }
  
  return null
}
```

### **4. Refresh Token Automático**
```typescript
const refreshCustomerSession = async () => {
  const refreshToken = localStorage.getItem('customer_refresh_token')
  
  if (!refreshToken) return null
  
  const response = await fetch('http://localhost:3001/api/gateway?resource=auth&action=refresh', {
    method: 'POST',
    headers: {
      'x-api-key': 'df_test_key_123456789',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  
  if (response.ok) {
    const data = await response.json()
    
    // Atualizar tokens
    localStorage.setItem('customer_token', data.session.token)
    localStorage.setItem('customer_refresh_token', data.session.refresh_token)
    
    return data.customer
  }
  
  return null
}
```

### **5. Logout**
```typescript
const logoutCustomer = async () => {
  const token = localStorage.getItem('customer_token')
  
  if (token) {
    await fetch(`http://localhost:3001/api/gateway?resource=auth&action=logout&token=${token}`, {
      method: 'POST',
      headers: {
        'x-api-key': 'df_test_key_123456789'
      }
    })
  }
  
  // Limpar localStorage
  localStorage.removeItem('customer_token')
  localStorage.removeItem('customer_refresh_token')
}
```

## 🔒 **Segurança**

- **Tokens**: Gerados com 32 bytes de aleatoriedade
- **Expiração**: 7 dias por padrão
- **Refresh**: Tokens podem ser renovados automaticamente
- **RLS**: Row Level Security protege dados por empresa
- **HTTPS**: Recomendado em produção

## 📊 **Estrutura do Banco**

### **Tabela customers**
```sql
ALTER TABLE public.customers 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### **Tabela customer_sessions**
```sql
CREATE TABLE public.customer_sessions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES public.customers(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 **Fluxo Completo**

1. **Registro**: Cliente se registra → Cria auth user + customer + session
2. **Login**: Cliente faz login → Valida credenciais + nova session
3. **Navegação**: Token é validado em cada requisição
4. **Refresh**: Token expirado → Refresh automático
5. **Logout**: Cliente sai → Session desativada

**Agora você tem um sistema de autenticação completo e seguro para os clientes do e-commerce!** 🎉 