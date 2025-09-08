export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  brand?: string;
  sku: string;
  price: number;
  price_offer?: number;
  date_create_promotion?: string;
  date_end_promotion?: string;
  taxa?: number;
  ammount_stock: number;
  min_stock?: number;
  barscode?: string;
  heigther?: number;
  height?: number;
  width?: number;
  depth?: number;
  link_product?: string;
  active: boolean;
  is_main?: boolean;
  tags?: string[];
  seo?: string;
  days_produtions_create?: number;
  corporate_id: number;
  created_at: string;
  updated_at: string;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: number;
  product_id: number;
  name: string;
  type: 'color' | 'size' | 'material' | 'style';
  value: string;
  price_modifier?: number;
  stock: number;
  sku: string;
  active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  corporate_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SalesAnalytics {
  totalSales: number;
  orderCount: number;
  averageOrder: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
  parent_id?: number;
  corporate_id: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: number;
  customer_id: number;
  address_id: number;
  address_type: 'home' | 'work' | 'shipping' | 'billing';
  label: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  address: Address;
}

export interface CustomerSession {
  token: string;
  refresh_token: string;
  expires_at: string;
}

export interface OrderProduct {
  id: number;
  name: string;
  price: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  product: OrderProduct;
}

export interface OrderCustomer {
  name: string;
  email: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total_amount: string;
  created_at: string;
  customers: OrderCustomer;
  order_items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
}

export interface CreditCard {
  id: number;
  customer_id: number;
  corporate_id: number;
  card_token: string;
  card_type: 'credit' | 'debit';
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'diners' | 'discover' | 'jcb' | 'hipercard' | 'aura';
  last_four_digits: string;
  holder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  is_active: boolean;
  gateway: string;
  gateway_card_id?: string;
  fingerprint?: string;
  created_at: string;
  updated_at: string;
}
