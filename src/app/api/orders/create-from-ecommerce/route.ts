import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/config/app'

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// Tipos
interface OrderItem {
  product_id?: number | null
  quantity: number
  unit_price: number
  discount_amount?: number
  notes?: string | null
  metadata?: Record<string, unknown>
}

interface CreateOrderRequest {
  phone: string
  customer_name: string
  corporate_id?: number
  token?: string // Token para identificar cliente (opcional)
  ref?: string // Referência alternativa ao token (opcional)
  items: OrderItem[]
  total_amount: number
  subtotal: number
  tax_amount?: number
  discount_amount?: number
  shipping_amount?: number
  payment_method: string
  payment_status?: string
  status?: string
  delivery_address?: Record<string, unknown>
  billing_address?: Record<string, unknown>
  metadata?: Record<string, unknown>
  notes?: string | null
  source?: string
}

/**
 * Normaliza telefone removendo todos caracteres não numéricos
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Valida os dados da requisição
 */
function validateRequest(data: Partial<CreateOrderRequest>): { valid: boolean; error?: string } {
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
    return { valid: false, error: 'phone é obrigatório e deve ser uma string não vazia' }
  }

  if (!data.customer_name || typeof data.customer_name !== 'string' || data.customer_name.trim() === '') {
    return { valid: false, error: 'customer_name é obrigatório e deve ser uma string não vazia' }
  }

  if (!data.corporate_id || typeof data.corporate_id !== 'number') {
    return { valid: false, error: 'corporate_id é obrigatório e deve ser um número' }
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, error: 'items é obrigatório e deve ser um array não vazio' }
  }

  // Validar cada item
  for (const item of data.items) {
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return { valid: false, error: 'Cada item deve ter quantity > 0' }
    }
    if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
      return { valid: false, error: 'Cada item deve ter unit_price >= 0' }
    }
  }

  if (typeof data.total_amount !== 'number' || data.total_amount <= 0) {
    return { valid: false, error: 'total_amount é obrigatório e deve ser > 0' }
  }

  if (typeof data.subtotal !== 'number' || data.subtotal <= 0) {
    return { valid: false, error: 'subtotal é obrigatório e deve ser > 0' }
  }

  if (!data.payment_method || typeof data.payment_method !== 'string') {
    return { valid: false, error: 'payment_method é obrigatório e deve ser uma string' }
  }

  return { valid: true }
}

/**
 * Remove sufixo do WhatsApp do telefone
 */
function cleanPhone(phone: string): string {
  return phone.replace(/@s\.whatsapp\.net/gi, '').trim()
}

/**
 * Busca cliente por token na API externa
 */
async function getCustomerByToken(
  apiUrl: string,
  apiKey: string,
  token: string,
  ref?: string
): Promise<{ customerId: number }> {
  try {
    // URL da API externa para buscar cliente por token
    const url = new URL(`${apiUrl}/api/delivery-links/customer`)
    url.searchParams.append('token', token)
    if (ref) {
      url.searchParams.append('ref', ref)
    }

    console.log('🔍 Buscando cliente por token:', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || 'Token inválido ou expirado')
    }

    const data = await response.json()
    if (data.customer && data.customer.id) {
      console.log('👤 Cliente identificado via token:', data.customer.id)
      return { customerId: data.customer.id }
    }

    throw new Error('Cliente não encontrado no token')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    throw new Error(`Erro ao buscar cliente por token: ${errorMessage}`)
  }
}

/**
 * Busca ou cria cliente na API externa (tabela customer_data)
 * Retorna o customer_id para ser usado no payload do pedido
 */
async function getOrCreateCustomer(
  apiUrl: string,
  apiKey: string,
  phone: string,
  corporateId: number,
  customerName?: string
): Promise<{ customerId: number; created: boolean }> {
  const normalizedPhone = normalizePhone(phone)

  try {
    // Verificar se a API usa formato gateway ou direto
    const baseApiUrl = apiUrl.includes('/api/gateway') ? apiUrl : `${apiUrl}/api/gateway`
    
    console.log('🔍 Buscando cliente na customer_data por telefone:', normalizedPhone)
    
    // Tentar buscar cliente por telefone (com e sem sufixo @s.whatsapp.net)
    // Muitos clientes estão cadastrados com o sufixo
    const phoneVariants = [
      normalizedPhone, // Sem sufixo
      `${normalizedPhone}@s.whatsapp.net`, // Com sufixo
    ]
    
    for (const phoneVariant of phoneVariants) {
      try {
        console.log(`🔍 Tentando buscar com telefone: ${phoneVariant}`)
        const searchUrl = `${baseApiUrl}?resource=customers&action=get_by_phone&phone=${encodeURIComponent(phoneVariant)}&corporate_id=${corporateId}`
        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        })

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          if (searchData.customer && searchData.customer.id) {
            console.log(`✅ Cliente encontrado na customer_data com telefone: ${phoneVariant}. ID:`, searchData.customer.id)
            return { customerId: searchData.customer.id, created: false }
          }
        }
      } catch (error) {
        console.log(`⚠️ Erro ao buscar com telefone ${phoneVariant}:`, error)
        // Continuar tentando com o próximo formato
      }
    }
    
    console.log('⚠️ Cliente não encontrado com nenhum formato de telefone')

    // Se não encontrou, criar novo cliente na customer_data
    // IMPORTANTE: Criar com o telefone normalizado (sem sufixo) para padronização
    console.log('📝 Cliente não encontrado. Criando novo registro na customer_data...')
    
    // Validar que temos os dados necessários para criar o cliente
    if (!normalizedPhone || normalizedPhone.trim() === '') {
      throw new Error('phone é obrigatório para criar novo cliente')
    }
    
    // A API externa exige customer_name para criar cliente
    // Se não fornecido, usar um valor padrão
    const finalCustomerName = customerName && customerName.trim() !== '' 
      ? customerName.trim() 
      : 'Cliente'
    
    console.log('📝 Dados do cliente:', { phone: normalizedPhone, corporate_id: corporateId, customer_name: finalCustomerName })
    
    const createUrl = `${baseApiUrl}?resource=customers&action=create`
    const createPayload = {
      phone: normalizedPhone,
      customer_name: finalCustomerName, // API externa espera customer_name, não name
      corporate_id: corporateId,
    }
    
    console.log('📤 Payload de criação:', JSON.stringify(createPayload, null, 2))
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(createPayload),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || 'Erro ao criar cliente')
    }

    const createData = await createResponse.json()
    if (createData.customer && createData.customer.id) {
      console.log('✅ Cliente criado na customer_data. ID:', createData.customer.id)
      return { customerId: createData.customer.id, created: true }
    }

    throw new Error('Resposta inválida ao criar cliente')
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar/criar cliente na customer_data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    throw new Error(`Erro ao processar cliente: ${errorMessage}`)
  }
}

/**
 * Handler OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * Handler POST para criar pedido
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  try {
    console.log('📥 Iniciando criação de pedido via ecommerce')
    console.log('📍 IP:', clientIp)

    // Ler body da requisição
    const body: CreateOrderRequest = await request.json()
    console.log('📦 Dados recebidos:', {
      phone: body.phone,
      customer_name: body.customer_name,
      corporate_id: body.corporate_id,
      items_count: body.items?.length,
    })

    // Validar corporate_id
    const corporateId = body.corporate_id || appConfig.corporateId
    if (!corporateId) {
      return NextResponse.json(
        { success: false, error: 'corporate_id é obrigatório' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validar dados
    const validation = validateRequest({ ...body, corporate_id: corporateId })
    if (!validation.valid) {
      console.log('❌ Validação falhou:', validation.error)
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: corsHeaders }
      )
    }

    // Limpar telefone (remover sufixo WhatsApp)
    const cleanPhoneNumber = cleanPhone(body.phone)
    const normalizedPhone = normalizePhone(cleanPhoneNumber)

    // URL da API externa
    const apiUrl = process.env.NEXT_PUBLIC_DOTFLOW_API_URL_PUBLIC 
      || process.env.NEXT_PUBLIC_DOTFLOW_API_URL 
      || 'http://localhost:3001'
    
    // API Key
    const apiKey = request.headers.get('x-api-key') || appConfig.apiKey

    // Buscar customer_id: por token (prioritário) ou buscar/criar por telefone
    // IMPORTANTE: Sempre obter customer_id antes de criar o pedido
    let customerId: number | undefined
    let customerCreated = false

    if (body.token) {
      // Se token fornecido, buscar customer_id usando o token
      console.log('🔑 Token fornecido. Buscando customer_id via token...')
      try {
        const customerData = await getCustomerByToken(apiUrl, apiKey, body.token, body.ref)
        customerId = customerData.customerId
        customerCreated = false
        console.log(`✅ Token válido. Customer ID obtido:`, customerId)
      } catch (error) {
        console.error('❌ Erro ao buscar cliente por token:', error)
        return NextResponse.json(
          { success: false, error: 'Token inválido ou expirado. Não foi possível identificar o cliente.' },
          { status: 400, headers: corsHeaders }
        )
      }
    } else {
      // Se não há token, buscar/criar cliente na customer_data ANTES de criar pedido
      console.log('📞 Sem token fornecido. Buscando/criando cliente na customer_data...')
      const customerData = await getOrCreateCustomer(
        apiUrl,
        apiKey,
        normalizedPhone,
        corporateId,
        body.customer_name // Passar customer_name apenas para criação do cliente, não para o payload do pedido
      )
      customerId = customerData.customerId
      customerCreated = customerData.created
      console.log(`✅ Cliente ${customerCreated ? 'criado' : 'encontrado'} na customer_data. ID:`, customerId)
    }

    // Validar que temos um customer_id válido antes de prosseguir
    if (!customerId || typeof customerId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Erro ao obter customer_id. Não foi possível identificar ou criar o cliente.' },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log(`📋 Customer ID obtido: ${customerId}. Será incluído no payload.`)

    const externalApiUrl = `${apiUrl}/api/orders/create`

    // Preparar metadata com itens no formato esperado pela API externa
    // Remover customer_name e phone do metadata se existirem
    const bodyMetadata = { ...(body.metadata || {}) }
    delete bodyMetadata.customer_name
    delete bodyMetadata.phone
    
    const metadata: Record<string, unknown> = {
      source: body.source || (body.metadata?.source as string) || 'ecommerce',
      ...bodyMetadata,
    }

    // Adicionar itens ao metadata no formato esperado
    body.items.forEach((item, index) => {
      if (item.product_id) {
        metadata[`product_id_${index}`] = item.product_id
      }
      metadata[`product_price_${index}`] = item.unit_price
      metadata[`product_qty_${index}`] = item.quantity
      
      // Nome do item (se houver no metadata do item)
      if (item.metadata?.product_name) {
        metadata[`item_${index}`] = item.metadata.product_name
      }
      
      // Adicionar outros campos do metadata do item
      if (item.metadata) {
        Object.keys(item.metadata).forEach(key => {
          if (key !== 'product_name' && item.metadata) {
            metadata[`${key}_${index}`] = item.metadata[key]
          }
        })
      }
    })

    // Adicionar endereços se fornecidos
    if (body.delivery_address) {
      metadata.delivery_address = body.delivery_address
    }
    if (body.billing_address) {
      metadata.billing_address = body.billing_address
    }

    // Preparar payload para API externa conforme EXEMPLO-PAYLOAD-ECOMMERCE.md
    // IMPORTANTE: customer_id sempre deve ser incluído (obtido via token ou busca/criação)
    const payload: Record<string, unknown> = {
      customer_id: customerId, // ID do cliente obtido (via token ou busca/criação)
      company_id: corporateId,
      amount: body.total_amount,
      currency: 'brl',
      status: body.status || 'pending_payment',
      payment_method: body.payment_method,
      description: body.notes || 'Pedido do ecommerce',
      notes: body.notes || null,
      metadata: metadata,
    }

    console.log(`📋 customer_id incluído no payload: ${customerId}${body.token ? ' (obtido via token)' : ' (obtido via busca/criação)'}`)

    console.log('🔄 Enviando pedido para API externa:', externalApiUrl)
    console.log('📦 Payload:', JSON.stringify(payload, null, 2))

    // Fazer requisição para API externa
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      console.error('❌ Erro na API externa:', errorData)
      
      return NextResponse.json(
        { success: false, error: errorData.error || 'Erro ao criar pedido na API externa' },
        { status: response.status, headers: corsHeaders }
      )
    }

    const result = await response.json()

    const duration = Date.now() - startTime
    console.log(`✅ Pedido criado com sucesso em ${duration}ms`)

    // Retornar resposta formatada
    return NextResponse.json(
      {
        success: true,
        order_id: result.order_id || result.order?.order_number,
        customer_id: customerId,
        customer_created: customerCreated,
        order: result.order || result,
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    console.error('❌ Erro ao processar pedido:', error)
    console.error('⏱️ Duração:', duration, 'ms')

    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

