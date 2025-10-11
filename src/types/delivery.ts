import { Product } from './dotflow';

export interface ProductOptions {
  flavors: string[];
  size: string;
  border: string;
  extras: string[];
  quantity: number;
}

export interface PizzaCategory {
  id: string;
  name: string;
  icon: string;
}

export interface PizzaSize {
  id: string;
  name: string;
  price: number;
}

export interface PizzaBorder {
  id: string;
  name: string;
  price: number;
}

export interface PizzaExtra {
  id: string;
  name: string;
  price: number;
}

export interface DeliveryCartItem {
  product: Product;
  quantity: number;
  options?: {
    flavors?: string[];
    size?: string;
    border?: string;
    extras?: string[];
  };
}
