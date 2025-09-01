import { Product, Customer, SalesAnalytics, ProductVariation, Category, Address, CustomerSession } from '@/types/dotflow';

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id?: number;
  customer_id: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  payment_method: string;
  shipping_method: string;
  order_items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export class DotFlowAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_DOTFLOW_API_URL || 'http://localhost:3001/api/gateway';
    this.apiKey = process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || 'df_test_key_123456789';
    
    console.log('🔧 DotFlow API Config:', {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey ? '***' : 'Não configurado'
    });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🌐 DotFlow API Request:', {
      url,
      method: options.method || 'GET',
      endpoint
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 DotFlow API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 DotFlow API Data:', data);
      return data;
    } catch (error) {
      console.error('❌ DotFlow API Error:', error);
      // Se for erro de rede (API não disponível), relançar
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('API não disponível');
      }
      throw error;
    }
  }

  // Produtos
  async getProducts(): Promise<{ products: Product[] }> {
    return this.request('?resource=products&action=list');
  }

  async getProductVariations(productId: number): Promise<{ variations: ProductVariation[] }> {
    return this.request(`?resource=product_variations&action=list&product_id=${productId}`);
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request('?resource=categories&action=list');
  }

  // Endereços
  async getAddresses(): Promise<{ addresses: Address[] }> {
    return this.request('?resource=addresses&action=list');
  }

  async getAddress(addressId: number): Promise<{ address: Address }> {
    return this.request(`?resource=addresses&action=get&id=${addressId}`);
  }

  async createAddress(address: Partial<Address>): Promise<{ address: Address }> {
    return this.request('?resource=addresses&action=create', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateAddress(addressId: number, address: Partial<Address>): Promise<{ address: Address }> {
    return this.request(`?resource=addresses&action=update&id=${addressId}`, {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async createProduct(product: Partial<Product>) {
    return this.request('?resource=products&action=create', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Clientes
  async getCustomers(): Promise<{ customers: Customer[] }> {
    return this.request('?resource=customers&action=list');
  }

  async createCustomer(customer: Partial<Customer>) {
    return this.request('?resource=customers&action=create', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Autenticação de Clientes
  async registerCustomer(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    document?: string;
    document_type?: string;
  }): Promise<{ customer: Customer; session: CustomerSession }> {
    return this.request('?resource=auth&action=register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        document: userData.document,
        document_type: userData.document_type || 'CPF'
      }),
    });
  }

  async loginCustomer(email: string, password: string): Promise<{ customer: Customer; session: CustomerSession }> {
    return this.request('?resource=auth&action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logoutCustomer(token: string): Promise<{ success: boolean }> {
    return this.request(`?resource=auth&action=logout&token=${token}`, {
      method: 'POST',
    });
  }

  async refreshCustomerSession(refreshToken: string): Promise<{ customer: Customer; session: CustomerSession }> {
    return this.request('?resource=auth&action=refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async validateCustomerSession(token: string): Promise<{ customer: Customer }> {
    return this.request(`?resource=auth&action=validate&token=${token}`);
  }

  // Analytics
  async getSalesAnalytics() {
    return this.request('?resource=analytics&action=sales');
  }

  // Pedidos
  async getOrders() {
    return this.request('?resource=orders&action=list');
  }

  async createOrder(order: Partial<Order>) {
    return this.request('?resource=orders&action=create', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: number, status: Order['status']) {
    return this.request('?resource=orders&action=update', {
      method: 'PUT',
      body: JSON.stringify({ id: orderId, status }),
    });
  }
}

export const dotflowAPI = new DotFlowAPI();
