'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Customer, AuthSession, authService } from '@/services/authService'

interface AuthContextType {
  customer: Customer | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    name: string
    phone: string
    document?: string
    document_type?: string
  }) => Promise<void>
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
            console.log('✅ Sessão válida carregada:', response.customer.name)
          } catch (error) {
            console.warn('⚠️ Token inválido, tentando refresh:', error)
            // Token expirado, tentar refresh
            try {
              const refreshResponse = await authService.refreshToken(refreshToken)
              setCustomer(refreshResponse.customer)
              setSession(refreshResponse.session)
              
              localStorage.setItem('customer_token', refreshResponse.session.token)
              localStorage.setItem('customer_refresh_token', refreshResponse.session.refresh_token)
              console.log('✅ Sessão renovada:', refreshResponse.customer.name)
            } catch (refreshError) {
              console.error('❌ Refresh falhou, limpando dados:', refreshError)
              // Refresh falhou, limpar localStorage
              localStorage.removeItem('customer_token')
              localStorage.removeItem('customer_refresh_token')
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão:', error)
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
      
      console.log('✅ Login realizado:', response.customer.name)
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    phone: string
    document?: string
    document_type?: string
  }) => {
    try {
      const response = await authService.register(userData)
      setCustomer(response.customer)
      setSession(response.session)
      
      localStorage.setItem('customer_token', response.session.token)
      localStorage.setItem('customer_refresh_token', response.session.refresh_token)
      
      console.log('✅ Registro realizado:', response.customer.name)
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (session?.token) {
        await authService.logout(session.token)
        console.log('✅ Logout realizado na API')
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error)
    } finally {
      setCustomer(null)
      setSession(null)
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_refresh_token')
      console.log('✅ Dados locais limpos')
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
        
        console.log('✅ Sessão renovada:', response.customer.name)
      }
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error)
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