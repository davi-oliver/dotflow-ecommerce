
# 🛒 Implementação de Autenticação no E-commerce




## 📋 **Checklist de Implementação**

### **1. Configuração do Banco de Dados**
- [ ] Executar `customer_auth_setup_safe.sql` no Supabase
- [ ] Verificar setup com `check_auth_setup.sql`
- [ ] Confirmar que a API Gateway está funcionando

### **2. Configuração do Projeto E-commerce**
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências necessárias
- [ ] Criar serviços de autenticação

### **3. Implementação dos Componentes**
- [ ] Página de registro
- [ ] Página de login
- [ ] Contexto de autenticação
- [ ] Proteção de rotas
- [ ] Header com informações do usuário

---

## 🔧 **1. Configuração Inicial**

### **Variáveis de Ambiente (.env.local)**
```env
# DotFlow API
NEXT_PUBLIC_DOTFLOW_API_URL=http://localhost:3001/api/gateway
NEXT_PUBLIC_DOTFLOW_API_KEY=df_test_key_123456789

# Supabase (se necessário)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **Instalar Dependências**
```bash
npm install @types/node
npm install --save-dev @types/react @types/react-dom
```

---

## 🚀 **2. Serviços de Autenticação**

### **services/authService.ts**
```typescript
const API_URL = process.env.NEXT_PUBLIC_DOTFLOW_API_URL
const API_KEY = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  document?: string
  document_type?: string
  status: string
  auth_user_id: string
  company_id: number
  created_at: string
  updated_at: string
}

export interface AuthSession {
  token: string
  refresh_token: string
  expires_at: string
}

export interface AuthResponse {
  customer: Customer
  session: AuthSession
}

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`
    const headers = {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro na requisição')
    }

    return response.json()
  }

  async register(userData: {
    email: string
    password: string
    name: string
    phone: string
    document?: string
    document_type?: string
  }): Promise<AuthResponse> {
    return this.makeRequest('?resource=auth&action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.makeRequest('?resource=auth&action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(token: string): Promise<void> {
    await this.makeRequest(`?resource=auth&action=logout&token=${token}`, {
      method: 'GET',
    })
  }

  async validateToken(token: string): Promise<AuthResponse> {
    return this.makeRequest(`?resource=auth&action=validate&token=${token}`, {
      method: 'GET',
    })
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.makeRequest('?resource=auth&action=refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }
}

export const authService = new AuthService()
```

---

## 🎯 **3. Contexto de Autenticação**

### **contexts/AuthContext.tsx**
```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Customer, AuthSession, authService } from '@/services/authService'

interface AuthContextType {
  customer: Customer | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!customer && !!session

  // Carregar sessão do localStorage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = localStorage.getItem('customer_token')
        const refreshToken = localStorage.getItem('customer_refresh_token')

        if (token && refreshToken) {
          try {
            const response = await authService.validateToken(token)
            setCustomer(response.customer)
            setSession(response.session)
          } catch (error) {
            // Token expirado, tentar refresh
            try {
              const refreshResponse = await authService.refreshToken(refreshToken)
              setCustomer(refreshResponse.customer)
              setSession(refreshResponse.session)
              
              localStorage.setItem('customer_token', refreshResponse.session.token)
              localStorage.setItem('customer_refresh_token', refreshResponse.session.refresh_token)
            } catch (refreshError) {
              // Refresh falhou, limpar localStorage
              localStorage.removeItem('customer_token')
              localStorage.removeItem('customer_refresh_token')
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setCustomer(response.customer)
      setSession(response.session)
      
      localStorage.setItem('customer_token', response.session.token)
      localStorage.setItem('customer_refresh_token', response.session.refresh_token)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData)
      setCustomer(response.customer)
      setSession(response.session)
      
      localStorage.setItem('customer_token', response.session.token)
      localStorage.setItem('customer_refresh_token', response.session.refresh_token)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      if (session?.token) {
        await authService.logout(session.token)
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setCustomer(null)
      setSession(null)
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_refresh_token')
    }
  }

  const refreshSession = async () => {
    try {
      const refreshToken = localStorage.getItem('customer_refresh_token')
      if (refreshToken) {
        const response = await authService.refreshToken(refreshToken)
        setCustomer(response.customer)
        setSession(response.session)
        
        localStorage.setItem('customer_token', response.session.token)
        localStorage.setItem('customer_refresh_token', response.session.refresh_token)
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      await logout()
    }
  }

  return (
    <AuthContext.Provider value={{
      customer,
      session,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
```

---

## 🛡️ **4. Proteção de Rotas**

### **components/ProtectedRoute.tsx**
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
```

---

## 📝 **5. Página de Registro**

### **pages/register.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    document_type: 'CPF',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        document: formData.document,
        document_type: formData.document_type,
      })
      
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar conta
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <input
                id="document"
                name="document"
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 🔐 **6. Página de Login**

### **pages/login.tsx**
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar na sua conta
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
              Não tem uma conta? Registre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 🎯 **7. Header com Informações do Usuário**

### **components/Header.tsx**
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Header() {
  const { customer, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              E-commerce
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">
                  Olá, {customer?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

---

## 🏗️ **8. Configuração do App**

### **app/layout.tsx**
```typescript
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## 🛡️ **9. Página Protegida (Dashboard)**

### **pages/dashboard.tsx**
```typescript
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { customer } = useAuth()

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informações da Conta
              </h3>
              
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {customer?.name}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {customer?.email}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {customer?.phone}
                    </dd>
                  </div>
                  
                  {customer?.document && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">CPF</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {customer.document}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

---

## 🧪 **10. Testes**

### **Testar Registro:**
```bash
# 1. Acesse /register
# 2. Preencha o formulário
# 3. Verifique se foi redirecionado para /dashboard
# 4. Verifique se o token foi salvo no localStorage
```

### **Testar Login:**
```bash
# 1. Acesse /login
# 2. Use as credenciais do usuário registrado
# 3. Verifique se foi redirecionado para /dashboard
# 4. Verifique se o token foi atualizado no localStorage
```

### **Testar Logout:**
```bash
# 1. Clique em "Sair" no header
# 2. Verifique se foi redirecionado para a página inicial
# 3. Verifique se os tokens foram removidos do localStorage
```

### **Testar Proteção de Rotas:**
```bash
# 1. Acesse /dashboard sem estar logado
# 2. Verifique se foi redirecionado para /login
# 3. Faça login e acesse /dashboard novamente
# 4. Verifique se conseguiu acessar normalmente
```

---

## 🚨 **11. Troubleshooting**

### **Erro: "API Key not found"**
- Verifique se a API key está correta no .env.local
- Confirme se o DotFlow está rodando na porta 3001

### **Erro: "Invalid credentials"**
- Verifique se o customer tem auth_user_id
- Confirme se o email está correto

### **Erro: "Account not properly registered"**
- O customer existe mas não tem auth_user_id
- Use o endpoint de registro para criar o auth_user_id

### **Token não está sendo salvo**
- Verifique se o localStorage está disponível
- Confirme se a resposta da API está correta

---

## ✅ **Checklist Final**

- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Serviços de autenticação implementados
- [ ] Contexto de autenticação funcionando
- [ ] Páginas de login e registro criadas
- [ ] Proteção de rotas implementada
- [ ] Header com informações do usuário
- [ ] Testes realizados
- [ ] Logout funcionando
- [ ] Refresh token automático

**🎉 Parabéns! Seu e-commerce agora tem autenticação completa integrada com o DotFlow!** 