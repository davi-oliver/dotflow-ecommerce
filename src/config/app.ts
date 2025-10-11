// Configurações do aplicativo DotFlow E-commerce
export const appConfig = {
  // Corporate ID fixo para este projeto whitelabel
  corporateId: parseInt(process.env.NEXT_PUBLIC_CORPORATE_ID || '9'),
  projectId: parseInt(process.env.NEXT_PUBLIC_PROJECT_ID || '6'),
  
  // API DotFlow
  apiUrl: process.env.NEXT_PUBLIC_DOTFLOW_API_URL || 'http://localhost:3001/api/gateway',
  apiKey: process.env.NEXT_PUBLIC_DOTFLOW_API_KEY || 'df_test_key_123456789',
  checkoutUrl: process.env.NEXT_PUBLIC_DOTFLOW_CHECKOUT || 'https://localhost:3000/checkout',
  
  // Informações do app
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'DotFlow E-commerce',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Configurações de negócio
  defaultShippingAmount: 15.9,
  defaultTaxAmount: 0,
  
  // Configurações de checkout
  checkout: {
    source: 'ecommerce',
    platform: 'dotflow-ecommerce',
    defaultPaymentStatus: 'pending',
    defaultOrderStatus: 'pending'
  }
} as const;

export default appConfig;
