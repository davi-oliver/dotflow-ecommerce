import { appConfig } from '@/config/app';
import { CartItem } from '@/contexts/CartContext';

export interface CheckoutParams {
  amount: number;
  currency: string;
  description: string;
  customer_id: string | null;
  company_id: number;
  meta_customer_name: string;
  meta_customer_phone: string;
  meta_order_id: string;
  meta_items_count: number;
  meta_cart_total: string;
  meta_source: string;
  meta_campaign: string;
  meta_coupon_code?: string;
  meta_coupon_discount?: string;
  meta_coupon_type?: string;
  meta_discount_amount?: string;
  [key: string]: string | number | null; // Para meta_item_X, meta_product_id_X, meta_product_price_X, meta_product_qty_X
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
    customerPhone?: string,
    couponInfo?: {
      code: string;
      discount: number;
      type: 'percentage' | 'fixed';
    }
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
        customerPhone,
        couponInfo
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
      if (item.options.border && item.options.border.name !== 'Tradicional') {
        parts.push(`Borda: ${item.options.border.name}`);
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
    customerPhone?: string,
    couponInfo?: {
      code: string;
      discount: number;
      type: 'percentage' | 'fixed';
    }
  ): CheckoutParams {
    const totalAmount = cartItems.reduce((total, item) => {
      let itemTotal = 0;
      
      // Preço do produto principal
      const productPrice = item.product.price_offer || item.product.price;
      itemTotal += productPrice * item.quantity;
      
      // Adicionar preço da borda (se houver)
      if (item.options?.border && item.options.border.name !== 'Tradicional') {
        itemTotal += (item.options.border.price || 0) * item.quantity;
      }
      
      // Adicionar preços dos adicionais (se houver)
      if (item.options?.extras && item.options.extras.length > 0) {
        item.options.extras.forEach(extra => {
          itemTotal += (extra.price || 0) * item.quantity;
        });
      }
      
      return total + itemTotal;
    }, 0);

    // Calcular desconto do cupom (se aplicável)
    let discountAmount = 0;
    let finalAmount = totalAmount;
    
    if (couponInfo) {
      if (couponInfo.type === 'percentage') {
        discountAmount = (totalAmount * couponInfo.discount) / 100;
      } else {
        discountAmount = Math.min(couponInfo.discount, totalAmount);
      }
      finalAmount = totalAmount - discountAmount;
    }

    const params: CheckoutParams = {
      amount: Math.round(finalAmount * 100), // Converter para centavos (valor final com desconto)
      currency: 'brl',
      description: `Carrinho com ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`,
      customer_id: customerId?.toString() || null,
      company_id: appConfig.corporateId,
      meta_customer_name: customerName || 'Cliente',
      meta_customer_phone: customerPhone || '(11) 99999-9999',
      meta_order_id: orderId.toString(),
      meta_items_count: cartItems.length,
      meta_cart_total: totalAmount.toFixed(2), // Subtotal sem desconto
      meta_source: 'ecommerce',
      meta_campaign: 'black_friday'
    };

    // Adicionar informações do cupom (se aplicável)
    if (couponInfo) {
      params.meta_coupon_code = couponInfo.code;
      params.meta_coupon_discount = couponInfo.discount.toString();
      params.meta_coupon_type = couponInfo.type;
      params.meta_discount_amount = discountAmount.toFixed(2);
    }

    // Adicionar itens como meta_item_X e dados do produto
    let itemNumber = 1;
    
    cartItems.forEach((item) => {
      const productPrice = item.product.price_offer || item.product.price;
      
      // Pizza principal
      params[`meta_item_${itemNumber}`] = `${item.product.name} (Qtd: ${item.quantity})`;
      params[`meta_product_id_${itemNumber}`] = item.product.id;
      params[`meta_product_price_${itemNumber}`] = productPrice.toFixed(2);
      params[`meta_product_qty_${itemNumber}`] = item.quantity;
      
      // Campos específicos para pizzas
      if (item.options) {
        if (item.options.size) {
          params[`meta_pizza_size_${itemNumber}`] = item.options.size;
        }
        if (item.options.flavors && item.options.flavors.length > 0) {
          const flavorNames = item.options.flavors.map(f => f.name).join(', ');
          params[`meta_pizza_flavors_${itemNumber}`] = flavorNames;
          // Identificar se é metade metade
          if (item.options.flavors.length === 2) {
            params[`meta_pizza_type_${itemNumber}`] = 'metade_metade';
          }
        }
      }
      
      itemNumber++;
      
      // Borda como produto separado
      if (item.options?.border && item.options.border.name !== 'Tradicional') {
        params[`meta_item_${itemNumber}`] = `Borda ${item.options.border.name} (Qtd: ${item.quantity})`;
        params[`meta_product_id_${itemNumber}`] = item.options.border.id;
        params[`meta_product_price_${itemNumber}`] = item.options.border.price?.toFixed(2) || '0.00';
        params[`meta_product_qty_${itemNumber}`] = item.quantity;
        itemNumber++;
      }
      
      // Adicionais como produtos separados
      if (item.options?.extras && item.options.extras.length > 0) {
        item.options.extras.forEach((extra) => {
          params[`meta_item_${itemNumber}`] = `${extra.name} (Qtd: ${item.quantity})`;
          params[`meta_product_id_${itemNumber}`] = extra.id;
          params[`meta_product_price_${itemNumber}`] = extra.price?.toFixed(2) || '0.00';
          params[`meta_product_qty_${itemNumber}`] = item.quantity;
          itemNumber++;
        });
      }
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
    customerPhone?: string,
    couponInfo?: {
      code: string;
      discount: number;
      type: 'percentage' | 'fixed';
    }
  ): Promise<void> {
    try {
      const { checkoutUrl } = await this.createOrderAndGetCheckoutParams(
        cartItems,
        customerId,
        customerName,
        customerPhone,
        couponInfo
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
