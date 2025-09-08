const API_URL = process.env.NEXT_PUBLIC_DOTFLOW_API_URL || 'http://localhost:3001/api/gateway'
const API_KEY = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || 'df_test_key_123456789'

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  document?: string
  document_type?: string
  status: string
  auth_user_id: string
  corporate_id: number
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
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    console.log('🌐 AuthService Request:', {
      url,
      method: options.method || 'GET',
      endpoint
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log('📡 AuthService Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro na requisição')
    }

    const data = await response.json()
    console.log('📦 AuthService Data:', data)
    return data
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