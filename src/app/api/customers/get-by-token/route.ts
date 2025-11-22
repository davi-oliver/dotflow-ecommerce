import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/config/app'

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

/**
 * Valida token/hash e retorna dados do cliente via API externa
 * 
 * Suporta:
 * - Token (obrigatório)
 * - Ref (opcional, para validação adicional)
 * 
 * NUNCA expor customer_id direto na URL em produção!
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const ref = searchParams.get('ref')

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400, headers: corsHeaders }
      )
    }

    // URL da API externa
    const apiUrl = process.env.NEXT_PUBLIC_DOTFLOW_API_URL_PUBLIC 
      || process.env.NEXT_PUBLIC_DOTFLOW_API_URL 
      || 'http://localhost:3001'
    
    // Construir URL com parâmetros
    const url = new URL(`${apiUrl}/api/delivery-links/customer`)
    url.searchParams.append('token', token)
    if (ref) {
      url.searchParams.append('ref', ref)
    }

    console.log('🔍 Buscando cliente na API externa:', url.toString())

    // Fazer requisição para API externa
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': appConfig.apiKey
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      console.error('❌ Erro na API externa:', errorData)
      
      return NextResponse.json(
        { error: errorData.error || 'Erro ao buscar cliente' },
        { status: response.status, headers: corsHeaders }
      )
    }

    const data = await response.json()

    // Validar estrutura da resposta
    if (!data.success || !data.customer) {
      return NextResponse.json(
        { error: 'Resposta inválida da API' },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ Cliente encontrado:', data.customer.id)

    // Retornar dados formatados
    return NextResponse.json(
      {
        customer: {
          id: data.customer.id,
          name: data.customer.name,
          phone: data.customer.phone,
          email: data.customer.email,
          address: data.customer.address || null,
          document: data.customer.document || null
        },
        link_info: data.link_info || null
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('❌ Erro ao buscar cliente por token:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}

