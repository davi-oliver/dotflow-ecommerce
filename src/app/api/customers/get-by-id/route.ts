import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

/**
 * ⚠️ APENAS PARA DESENVOLVIMENTO 
 * 
 * Este endpoint NÃO deve ser usado em produção!
 * Expor customer_id direto na URL viola princípios de segurança e LGPD.
 * 
 * Use get-by-token ao invés disso.
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Este endpoint não está disponível em produção por questões de segurança' },
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('id')

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createAdminClient()

    const { data: customer, error } = await supabase
      .from('customer_data')
      .select('id, name, phone, email, address')
      .eq('id', parseInt(customerId))
      .single()

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: typeof customer.address === 'string' 
            ? JSON.parse(customer.address) 
            : customer.address
        }
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('❌ Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}

