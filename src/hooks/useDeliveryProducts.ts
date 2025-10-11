import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/dotflow';
import { dotflowAPI } from '@/lib/dotflow-api';

interface DeliveryProductsState {
  mainProducts: Product[];
  complements: Product[];
  loading: boolean;
  error: string | null;
}

export function useDeliveryProducts() {
  const [state, setState] = useState<DeliveryProductsState>({
    mainProducts: [],
    complements: [],
    loading: true,
    error: null
  });

  const loadProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🔄 Carregando produtos do delivery...');

      // Carrega produtos principais e complementos em paralelo
      const [mainResponse, complementsResponse] = await Promise.all([
        dotflowAPI.getDeliveryMainProducts(),
        dotflowAPI.getDeliveryComplements()
      ]);

      console.log('✅ Produtos principais carregados:', mainResponse.products.length);
      console.log('✅ Complementos carregados:', complementsResponse.products.length);

      setState({
        mainProducts: mainResponse.products,
        complements: complementsResponse.products,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar produtos. Tente novamente.'
      }));
    }
  }, []);

  const reloadProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Carrega os produtos quando o hook é montado
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    ...state,
    reloadProducts,
    totalProducts: state.mainProducts.length + state.complements.length
  };
}


