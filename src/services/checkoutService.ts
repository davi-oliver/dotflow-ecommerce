import { appConfig } from '@/config/app';
import { CartItem } from '@/contexts/CartContext';

export interface CheckoutParams {
  amount: number;
  currency: string;
  description: string;
  customer_id: string | null;
  meta_customer_name: string;
  meta_customer_phone: string;
  meta_order_id: string;
  meta_items_count: number;
  meta_cart_total: string;
  meta_source: string;
  meta_campaign: string;
  [key: string]: string | number | null; // Para meta_item_X
}

export class CheckoutService {
  private static getExternalCheckoutUrl(): string {
    return appConfig.checkoutUrl;
  }

  /**
   * Cria um pedido na API DotFlow e retorna os dados para checkout externo
   */
  static async createOrderAndGetCheckoutParams(
    cartItems: CartItem[],
    customerId?: number,
    customerName?: string,
    customerPhone?: string
  ): Promise<{ orderId: string; checkoutUrl: string }> {
    try {
      // 1. Criar o pedido na API DotFlow
      const orderData = await this.createOrderInAPI(cartItems, customerId);
      
      // 2. Gerar parâmetros para checkout externo
      const checkoutParams = this.generateCheckoutParams(
        cartItems,
        orderData.order.id || orderData.order.order_number,
        customerId,
        customerName,
        customerPhone
      );

      // 3. Gerar URL de checkout externo
      const checkoutUrl = this.buildCheckoutUrl(checkoutParams);

      return {
        orderId: orderData.order.id?.toString() || orderData.order.order_number,
        checkoutUrl
      };
    } catch (error) {
      console.error('❌ Erro ao criar pedido para checkout:', error);
      throw new Error('Erro ao processar checkout. Tente novamente.');
    }
  }

  /**
   * Cria o pedido na API DotFlow
   */
  private static async createOrderInAPI(cartItems: CartItem[], customerId?: number) {
    // Preparar itens do pedido
    const orderItems = cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price_offer || item.product.price,
      total_price: (item.product.price_offer || item.product.price) * item.quantity,
      discount_amount: item.product.price_offer ? 
        (item.product.price - item.product.price_offer) * item.quantity : 0,
      notes: this.generateItemNotes(item),
      metadata: JSON.stringify({
        product_name: item.product.name,
        product_sku: item.product.sku,
        options: item.options
      })
    }));

    // Calcular totais
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const shippingAmount = appConfig.defaultShippingAmount;
    const taxAmount = appConfig.defaultTaxAmount;
    const discountAmount = orderItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

    const orderData = {
      customer_id: customerId || null,
      corporate_id: appConfig.corporateId,
      project_id: appConfig.projectId,
      total_amount: totalAmount,
      subtotal: subtotal,
      status: 'pending' as const,
      source: 'ecommerce',
      payment_status: 'pending' as const,
      payment_method: 'pending',
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      notes: `Pedido criado via e-commerce - ${new Date().toLocaleString('pt-BR')}`,
      transaction_id: null,
      metadata: JSON.stringify({
        cart_items_count: cartItems.length,
        checkout_completed_at: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        platform: 'ecommerce_frontend',
        source: 'ecommerce',
        app_name: appConfig.appName,
        app_version: appConfig.appVersion,
        corporate_id: appConfig.corporateId
      }),
      order_items: orderItems
    };

    console.log('📦 Criando pedido na API DotFlow:', orderData);

    // Criar pedido na API
    const response = await fetch(`${appConfig.apiUrl}?resource=orders&action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': appConfig.apiKey
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.order) {
      throw new Error('Resposta inválida da API');
    }

    console.log('✅ Pedido criado com sucesso na API DotFlow!');
    return result;
  }

  /**
   * Gera notas descritivas para o item do pedido
   */
  private static generateItemNotes(item: CartItem): string {
    const parts = [item.product.name];
    
    if (item.options) {
      if (item.options.size) {
        parts.push(`Tamanho: ${item.options.size}`);
      }
      if (item.options.flavors && item.options.flavors.length > 0) {
        parts.push(`Sabores: ${item.options.flavors.join(', ')}`);
      }
      if (item.options.border && item.options.border !== 'tradicional') {
        parts.push(`Borda: ${item.options.border}`);
      }
      if (item.options.extras && item.options.extras.length > 0) {
        parts.push(`Adicionais: ${item.options.extras.join(', ')}`);
      }
    }
    
    return parts.join(', ');
  }

  /**
   * Gera parâmetros para checkout externo
   */
  private static generateCheckoutParams(
    cartItems: CartItem[],
    orderId: string | number,
    customerId?: number,
    customerName?: string,
    customerPhone?: string
  ): CheckoutParams {
    const totalAmount = cartItems.reduce((total, item) => {
      const price = item.product.price_offer || item.product.price;
      return total + (price * item.quantity);
    }, 0);

    const params: CheckoutParams = {
      amount: Math.round(totalAmount * 100), // Converter para centavos
      currency: 'brl',
      description: `Carrinho com ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`,
      customer_id: customerId?.toString() || null,
      meta_customer_name: customerName || 'Cliente',
      meta_customer_phone: customerPhone || '(11) 99999-9999',
      meta_order_id: orderId.toString(),
      meta_items_count: cartItems.length,
      meta_cart_total: totalAmount.toFixed(2),
      meta_source: 'ecommerce',
      meta_campaign: 'black_friday'
    };

    // Adicionar itens como meta_item_X
    cartItems.forEach((item, index) => {
      params[`meta_item_${index + 1}`] = `${item.product.name} (Qtd: ${item.quantity})`;
    });

    return params;
  }

  /**
   * Constrói a URL de checkout externo com parâmetros
   */
  private static buildCheckoutUrl(params: CheckoutParams): string {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlParams.append(key, value.toString());
      }
    });

    return `${this.getExternalCheckoutUrl()}?${urlParams.toString()}`;
  }

  /**
   * Redireciona para checkout externo
   */
  static async redirectToExternalCheckout(
    cartItems: CartItem[],
    customerId?: number,
    customerName?: string,
    customerPhone?: string
  ): Promise<void> {
    try {
      const { checkoutUrl } = await this.createOrderAndGetCheckoutParams(
        cartItems,
        customerId,
        customerName,
        customerPhone
      );

      console.log('🔄 Redirecionando para checkout externo:', checkoutUrl);
      
      // Redirecionar para a página externa
      if (typeof window !== 'undefined') {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('❌ Erro ao redirecionar para checkout:', error);
      throw error;
    }
  }
}
