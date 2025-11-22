/**
 * Gera um número de pedido único baseado no corporate_id e timestamp
 * Formato: {corporate_id}-{timestamp}-{random}
 * Exemplo: 12-20240101120000-1234
 */
export interface GenerateOrderNumberParams {
  corporateId: number
  companyName?: string
}

export function generateOrderNumber({ corporateId, companyName }: GenerateOrderNumberParams): string {
  const now = new Date()
  
  // Formato: YYYYMMDDHHMMSS
  const timestamp = now
    .toISOString()
    .replace(/[-:T]/g, '')
    .replace(/\..+/, '')
    .slice(0, 14)
  
  // Número aleatório de 4 dígitos
  const random = Math.floor(1000 + Math.random() * 9000)
  
  // Prefixo opcional baseado no nome da empresa (primeiras 3 letras)
  let prefix = ''
  if (companyName) {
    prefix = companyName
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3)
    if (prefix) {
      prefix = `${prefix}-`
    }
  }
  
  // Formato final: {prefix}{corporate_id}-{timestamp}-{random}
  return `${prefix}${corporateId}-${timestamp}-${random}`
}

