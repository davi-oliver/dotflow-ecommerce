'use client';

import { Star, MapPin, Clock, Bike } from 'lucide-react';

interface RestaurantInfoProps {
  name?: string;
  distance?: string;
  minOrder?: string;
  rating?: number;
  reviewCount?: number;
  status?: 'open' | 'closed';
  openTime?: string;
  deliveryTime?: string;
}

export function RestaurantInfo({
  name = "Go Pizza",
  distance = "2.4 km",
  minOrder = "R$ 35,00",
  rating = 4.9,
  reviewCount = 557,
  status = "open",
  openTime = "Aberto agora",
  deliveryTime = "30-45 min"
}: RestaurantInfoProps) {
  return (
    <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
      {/* Pattern de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Logo e Título */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-20 h-20 lg:w-28 lg:h-28 bg-white rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
              <span className="text-4xl lg:text-5xl">🍕</span>
            </div>
            
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{name}</h1>
              <p className="text-red-100 text-sm lg:text-base">Pizzas artesanais com ingredientes frescos</p>
            </div>
          </div>

          {/* Informações da Loja */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:min-w-[280px]">
            {/* Status */}
            <div className={`px-4 py-3 rounded-xl font-semibold text-sm lg:text-base flex items-center justify-center gap-2 ${
              status === 'open' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-white/20 backdrop-blur-sm text-white'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{status === 'open' ? openTime : 'Fechado'}</span>
            </div>

            {/* Info Grid */}
            <div className="col-span-2 lg:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Avaliação */}
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-lg font-bold">{rating}</span>
                  </div>
                  <p className="text-xs text-red-100">{reviewCount}+ avaliações</p>
                </div>

                {/* Distância */}
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg font-bold">{distance}</span>
                  </div>
                  <p className="text-xs text-red-100">Distância</p>
                </div>

                {/* Tempo de entrega */}
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Bike className="w-4 h-4" />
                    <span className="text-lg font-bold">{deliveryTime}</span>
                  </div>
                  <p className="text-xs text-red-100">Entrega</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge de Pedido Mínimo */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
            🎯 Pedido mínimo: <span className="font-bold">{minOrder}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
            🚚 Frete grátis acima de R$ 50,00
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
            ⚡ Entrega rápida
          </div>
        </div>
      </div>
    </div>
  );
}
