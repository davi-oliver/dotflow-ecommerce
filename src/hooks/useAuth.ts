import { useState, useEffect } from 'react';
import { dotflowAPI } from '@/lib/dotflow-api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage e validar sessão
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        
        if (token) {
          // Validar token na API
          const response = await dotflowAPI.validateCustomerSession(token);
          const customer = response.customer;
          
          const userData: User = {
            id: customer.id,
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || undefined,
            avatar: null
          };
          
          setUser(userData);
          console.log('✅ Sessão válida carregada:', userData);
        }
      } catch (error) {
        console.warn('⚠️ Sessão inválida, tentando refresh:', error);
        
        // Tentar refresh token
        try {
          const refreshToken = localStorage.getItem('customer_refresh_token');
          if (refreshToken) {
            const response = await dotflowAPI.refreshCustomerSession(refreshToken);
            const customer = response.customer;
            
            // Salvar novos tokens
            localStorage.setItem('customer_token', response.session.token);
            localStorage.setItem('customer_refresh_token', response.session.refresh_token);
            
            const userData: User = {
              id: customer.id,
              name: customer.name,
              email: customer.email || '',
              phone: customer.phone || undefined,
              avatar: null
            };
            
            setUser(userData);
            console.log('✅ Sessão renovada:', userData);
          }
        } catch (refreshError) {
          console.error('❌ Erro ao renovar sessão:', refreshError);
          // Limpar tokens inválidos
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_refresh_token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await dotflowAPI.loginCustomer(email, password);
      const customer = response.customer;
      const session = response.session;

      // Salvar tokens
      localStorage.setItem('customer_token', session.token);
      localStorage.setItem('customer_refresh_token', session.refresh_token);

      const userData: User = {
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || undefined,
        avatar: null
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login realizado com sucesso:', userData);
      return userData;
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    document?: string;
  }) => {
    try {
      const response = await dotflowAPI.registerCustomer({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        document: userData.document,
        document_type: 'CPF'
      });

      const customer = response.customer;
      const session = response.session;

      // Salvar tokens
      localStorage.setItem('customer_token', session.token);
      localStorage.setItem('customer_refresh_token', session.refresh_token);

      const user: User = {
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || undefined,
        avatar: null
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Registro realizado com sucesso:', user);
      return user;
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (token) {
        await dotflowAPI.logoutCustomer(token);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao fazer logout na API:', error);
    } finally {
      // Limpar dados locais
      setUser(null);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_refresh_token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };
} 