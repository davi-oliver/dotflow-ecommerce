'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types/dotflow';
import { dotflowAPI } from '@/lib/dotflow-api';
import { useCart } from '@/contexts/CartContext';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ChevronLeft, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Minus,
  Plus,
  MessageCircle,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { ReviewForm, ReviewList } from '@/components/reviews/ReviewComponents';

interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const cart = useCart();

  // Carregar produto da API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Carregando produto da API DotFlow...');
        
        // Tentar carregar da API
        const data = await dotflowAPI.getProducts();
        const apiProducts = data.products || [];
        
        if (apiProducts.length > 0) {
          const foundProduct = apiProducts.find((p: Product) => p.id.toString() === productId);
          
          if (foundProduct) {
            setProduct(foundProduct);
            console.log('✅ Produto carregado da API DotFlow:', foundProduct.name);
            console.log('💰 Preço:', foundProduct.price);
            console.log('📦 Estoque:', foundProduct.ammount_stock);
            
            // Variações não estão disponíveis na API atual
          } else {
            throw new Error('Produto não encontrado na API');
          }
        } else {
          throw new Error('Nenhum produto encontrado na API');
        }
        
      } catch (err) {
        console.warn('⚠️ API DotFlow não disponível, usando dados de exemplo:', err);
        setError('API não disponível - usando dados de demonstração');
        
        // Dados de exemplo para desenvolvimento
        const sampleProducts: Product[] = [
          {
            id: 1,
            name: "Smartphone Galaxy S23",
            description: "O mais recente smartphone Samsung com câmera de 108MP e processador Snapdragon 8 Gen 2. Este dispositivo oferece performance excepcional para jogos, fotografia profissional e multitarefa intensiva. Com tela AMOLED de 6.1 polegadas e bateria de 3900mAh, você terá uma experiência premium em suas mãos.",
            sku: "SAMS23-001",
            price: 4999.99,
            price_offer: 4499.99,
            ammount_stock: 15,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            name: "Notebook Dell Inspiron 15",
            description: "Notebook ideal para trabalho e estudos com Intel Core i7 e 16GB RAM. Perfeito para profissionais que precisam de performance e portabilidade. Tela Full HD de 15.6 polegadas e SSD de 512GB garantem velocidade e qualidade visual excepcionais.",
            sku: "DELL-INS-001",
            price: 3499.99,
            ammount_stock: 8,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-14T10:00:00Z",
            updated_at: "2024-01-14T10:00:00Z"
          },
          {
            id: 3,
            name: "Fone de Ouvido Bluetooth Sony",
            description: "Fone sem fio com cancelamento de ruído ativo e bateria de 30h. Tecnologia WH-1000XM4 oferece a melhor experiência de áudio com cancelamento de ruído do mercado. Ideal para viagens, trabalho e lazer.",
            sku: "BT-HEAD-001",
            price: 299.99,
            price_offer: 249.99,
            ammount_stock: 25,
            active: true,
            corporate_id: 1,
            created_at: "2024-01-13T10:00:00Z",
            updated_at: "2024-01-13T10:00:00Z"
          }
        ];
        
        const foundProduct = sampleProducts.find(p => p.id.toString() === productId);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setProduct(sampleProducts[0]); // Fallback para primeiro produto
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Dados de exemplo de avaliações
  const sampleReviews: Review[] = [
    {
      id: 1,
      userId: 1,
      userName: "João Silva",
      rating: 5,
      title: "Excelente produto!",
      comment: "Superou todas as minhas expectativas. A qualidade é excepcional e o preço está muito bom.",
      date: "2024-01-15",
      helpful: 12,
      notHelpful: 0,
      verified: true
    },
    {
      id: 2,
      userId: 2,
      userName: "Maria Santos",
      rating: 4,
      title: "Muito bom, recomendo",
      comment: "Produto de qualidade, entrega rápida. Só não dei 5 estrelas porque poderia ter mais cores disponíveis.",
      date: "2024-01-14",
      helpful: 8,
      notHelpful: 1,
      verified: true
    },
    {
      id: 3,
      userId: 3,
      userName: "Pedro Costa",
      rating: 5,
      title: "Perfeito!",
      comment: "Exatamente o que eu esperava. Funcionalidades incríveis e design moderno.",
      date: "2024-01-13",
      helpful: 15,
      notHelpful: 0,
      verified: false
    }
  ];

  useEffect(() => {
    setReviews(sampleReviews);
  }, []);

  const handleAddToCart = () => {
    if (product) {
      cart.addToCart(product, quantity);
      // Feedback visual
      const button = document.getElementById('add-to-cart-btn');
      if (button) {
        button.innerHTML = `
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Adicionado!
        `;
        setTimeout(() => {
          button.innerHTML = `
            <ShoppingCart class="w-5 h-5 mr-2" />
            Adicionar ao Carrinho
          `;
        }, 2000);
      }
    }
  };

  const handleAddToWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  const renderDiscountBadge = () => {
    // Verificação mais robusta para desconto
    if (!product || !product.price_offer || product.price_offer <= 0) {
      return null; // Não renderiza nada se não há produto ou desconto
    }
    
    if (product.price_offer >= product.price) {
      return null; // Não renderiza se o preço com desconto é maior ou igual ao original
    }
    
    const discountPercentage = getDiscountPercentage(product.price, product.price_offer);
    
    if (discountPercentage <= 0) {
      return null; // Não renderiza se o desconto é 0% ou negativo
    }
    
    return (
      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
        -{discountPercentage}%
      </div>
    );
  };

  const handleReviewHelpful = (reviewId: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const handleSubmitReview = (reviewData: { rating: number; title: string; comment: string }) => {
    const newReview: Review = {
      id: reviews.length + 1,
      userId: 999,
      userName: "Você",
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      notHelpful: 0,
      verified: true
    };
    
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Carregando produto...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Produto não encontrado</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">O produto que você está procurando não existe ou foi removido.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para a Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Início
            </button>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => router.push('/categories')}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Categorias
            </button>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-4xl">{product.name.charAt(0)}</span>
              </div>
              {renderDiscountBadge()}
            </div>
            
            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-8">
            {/* Título e Avaliações */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {averageRating.toFixed(1)} ({reviews.length} avaliações)
                  </span>
                </div>
                
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Escrever avaliação
                </button>
              </div>
            </div>

            {/* Preços */}
            <div className="space-y-2">
              {product.price_offer && product.price_offer > 0 && product.price_offer < product.price ? (
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price_offer!)}
                  </p>
                  <p className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </p>
                  <span className="inline-block bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Economia de {formatPrice(product.price - product.price_offer!)}
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>

            {/* Estoque */}
            <div className="flex items-center space-x-2">
              {product.ammount_stock > 0 ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{product.ammount_stock} unidades em estoque</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Fora de estoque</span>
                </div>
              )}
            </div>

            {/* Quantidade */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantidade:
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-4">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.ammount_stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Benefícios */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Benefícios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Entrega Grátis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Para compras acima de R$ 99</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Garantia</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1 ano de garantia</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Devolução</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30 dias para devolução</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Qualidade</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Produto certificado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Descrição do Produto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Avaliações */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Avaliações dos Clientes
              </h2>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Escrever Avaliação
              </button>
            </div>
            
            <ReviewList 
              reviews={reviews} 
              onHelpful={handleReviewHelpful}
            />
          </div>
        </div>

        {/* Produtos Relacionados */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Produto Relacionado {index}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                    R$ {(Math.random() * 1000 + 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Avaliação */}
      {showReviewForm && (
        <ReviewForm
          productId={product.id}
          productName={product.name}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
} 