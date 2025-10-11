# Módulo de Autenticação para Ecommerce

Este módulo implementa um sistema completo de autenticação para ecommerce baseado no Supabase, seguindo o mesmo padrão usado no dotflow.

## 📋 Estrutura do Módulo

### 🗄️ Banco de Dados
- **Arquivo**: `database_ecommerce_auth.sql`
- **Tabelas principais**:
  - `ecommerce_users` - Perfis de usuários
  - `ecommerce_user_addresses` - Endereços dos usuários
  - `ecommerce_user_preferences` - Preferências de notificação
  - `ecommerce_user_sessions` - Controle de sessões
  - `ecommerce_login_history` - Histórico de logins
  - `ecommerce_verification_tokens` - Tokens de verificação

### 🔌 Endpoints de API

#### Autenticação
- `POST /api/auth/signup` - Cadastro de usuário
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/me` - Dados do usuário atual

#### Perfil e Preferências
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/preferences` - Atualizar preferências
- `POST /api/auth/addresses` - Adicionar endereço
- `PUT /api/auth/addresses/:id` - Atualizar endereço
- `DELETE /api/auth/addresses/:id` - Deletar endereço
- `GET /api/auth/addresses` - Listar endereços

### 🎯 Tipos TypeScript
- **Arquivo**: `types/auth.ts`
- Tipos para requests, responses e interfaces de usuário
- Suporte completo para TypeScript

### 🔧 Cliente de Autenticação
- **Arquivo**: `lib/auth-client.ts`
- Cliente JavaScript/TypeScript para consumir as APIs
- Métodos para todas as operações de autenticação
- Gerenciamento automático de tokens

### 🛡️ Middleware
- **Arquivo**: `middleware/auth.ts`
- Middleware de autenticação
- Rate limiting
- Logging de requisições
- CORS

## 🚀 Como Usar

### 1. Configuração do Banco de Dados

Execute o script SQL para criar as tabelas:

```sql
-- Execute o arquivo database_ecommerce_auth.sql no seu banco Supabase
```

### 2. Configuração das Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Uso no Frontend

#### Cadastro de Usuário

```typescript
import { authClient } from '@/lib/auth-client';

const handleSignUp = async (formData) => {
  try {
    const response = await authClient.signUp({
      email: 'usuario@email.com',
      password: 'senha123',
      full_name: 'Nome Completo',
      phone: '(11) 99999-9999',
      confirm_password: 'senha123',
      terms: true,
      newsletter: true
    });

    if (response.success) {
      console.log('Usuário criado:', response.user);
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
  }
};
```

#### Login

```typescript
const handleSignIn = async (credentials) => {
  try {
    const response = await authClient.signIn({
      email: 'usuario@email.com',
      password: 'senha123'
    });

    if (response.success) {
      // Salvar tokens
      authClient.saveSession(response.session);
      console.log('Usuário logado:', response.user);
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

#### Recuperação de Senha

```typescript
const handleForgotPassword = async (email) => {
  try {
    const response = await authClient.forgotPassword(email);
    
    if (response.success) {
      console.log('Email enviado:', response.message);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

#### Buscar Dados do Usuário

```typescript
const getUserData = async () => {
  try {
    const response = await authClient.getMe();
    
    if (response.success) {
      console.log('Dados do usuário:', response.user);
      console.log('Endereços:', response.user.addresses);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

#### Atualizar Perfil

```typescript
const updateProfile = async (profileData) => {
  try {
    const response = await authClient.updateProfile({
      full_name: 'Novo Nome',
      phone: '(11) 88888-8888',
      date_of_birth: '1990-01-01',
      gender: 'male'
    });

    if (response.success) {
      console.log('Perfil atualizado:', response.user);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

#### Gerenciar Endereços

```typescript
// Adicionar endereço
const addAddress = async () => {
  try {
    const response = await authClient.addAddress({
      address_type: 'home',
      is_primary: true,
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567'
    });

    if (response.success) {
      console.log('Endereço adicionado:', response.address);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};

// Listar endereços
const getAddresses = async () => {
  try {
    const response = await authClient.getAddresses();
    
    if (response.success) {
      console.log('Endereços:', response.addresses);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### 4. Middleware de Autenticação

Para proteger rotas, use o middleware:

```typescript
import { authMiddleware } from '@/middleware/auth';

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/api/auth/me',
    '/api/auth/profile',
    '/ecommerce/dashboard/:path*',
    '/ecommerce/profile/:path*',
  ],
};
```

## 🔒 Recursos de Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só podem acessar seus próprios dados
- Políticas de segurança configuradas

### Rate Limiting
- Limite de 100 requisições por 15 minutos por IP
- Headers de retry-after para requisições bloqueadas

### Logging de Segurança
- Histórico completo de tentativas de login
- Logs de atividades do usuário
- Rastreamento de sessões

### Validação de Dados
- Validação de email e senha
- Verificação de termos de uso
- Sanitização de inputs

## 📊 Monitoramento

### Métricas Disponíveis
- Total de usuários cadastrados
- Tentativas de login (sucesso/falha)
- Endereços por usuário
- Preferências de notificação

### Logs de Auditoria
- Histórico de logins
- Alterações de perfil
- Atividades de endereços
- Sessões ativas

## 🛠️ Personalização

### Adicionar Novos Campos
1. Adicione o campo na tabela `ecommerce_users`
2. Atualize os tipos em `types/auth.ts`
3. Modifique as APIs conforme necessário

### Novas Preferências
1. Adicione o campo em `ecommerce_user_preferences`
2. Atualize o tipo `UserPreferences`
3. Modifique a API de preferências

### Novos Tipos de Endereço
1. Atualize o enum em `types/auth.ts`
2. Modifique a validação nas APIs
3. Atualize a interface do usuário

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de RLS**: Verifique se as políticas estão corretas
2. **Token expirado**: Implemente refresh automático
3. **Rate limit**: Ajuste os limites conforme necessário
4. **CORS**: Configure os origins permitidos

### Logs Úteis
- Verifique os logs do Supabase
- Monitore o histórico de login
- Acompanhe as métricas de API

## 📝 Exemplos de Uso Completo

Veja os arquivos de exemplo para implementações completas:
- `app/ecommerce/auth/sign-in/page.tsx`
- `app/ecommerce/auth/sign-up/page.tsx`
- `app/ecommerce/dashboard/page.tsx`

## 🔄 Integração com Frontend

Este módulo foi projetado para ser consumido por qualquer frontend (React, Vue, Angular, etc.) através das APIs REST. O cliente JavaScript fornecido facilita a integração com aplicações React/Next.js.
