import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const apiKey = request.headers.get('x-api-key') || appConfig.apiKey;
    const apiUrl = process.env.NEXT_PUBLIC_DOTFLOW_API_URL_PUBLIC 
      || process.env.NEXT_PUBLIC_DOTFLOW_API_URL 
      || 'http://localhost:3001';

    // Buscar pedido na API externa
    const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        order: data.order || data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar pedido:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

