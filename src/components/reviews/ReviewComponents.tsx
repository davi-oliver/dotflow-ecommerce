'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react';

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

interface ReviewFormProps {
  productId: number;
  productName: string;
  onSubmit: (review: Omit<Review, 'id' | 'date' | 'helpful' | 'notHelpful' | 'verified'>) => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, productName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    if (!title.trim()) {
      alert('Por favor, adicione um título para sua avaliação');
      return;
    }

    if (!comment.trim()) {
      alert('Por favor, adicione um comentário para sua avaliação');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit({
        userId: 1, // Simular usuário logado
        userName: 'Usuário',
        rating,
        title: title.trim(),
        comment: comment.trim()
      });
      
      // Limpar formulário
      setRating(0);
      setTitle('');
      setComment('');
      
    } catch (error) {
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Avaliar {productName}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avaliação em Estrelas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sua Avaliação *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {rating === 0 && 'Selecione uma avaliação'}
            {rating === 1 && 'Péssimo'}
            {rating === 2 && 'Ruim'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bom'}
            {rating === 5 && 'Excelente'}
          </p>
        </div>

        {/* Título da Avaliação */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título da Avaliação *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Resuma sua experiência em poucas palavras"
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 caracteres
          </p>
        </div>

        {/* Comentário */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Seu Comentário *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Conte mais sobre sua experiência com este produto..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 caracteres
          </p>
        </div>

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || rating === 0 || !title.trim() || !comment.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
  onHelpful: (reviewId: number, isHelpful: boolean) => void;
}

export function ReviewItem({ review, onHelpful }: ReviewItemProps) {
  const [hasVoted, setHasVoted] = useState<'helpful' | 'notHelpful' | null>(null);

  const handleVote = (isHelpful: boolean) => {
    if (hasVoted) return;
    
    setHasVoted(isHelpful ? 'helpful' : 'notHelpful');
    onHelpful(review.id, isHelpful);
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0">
      {/* Header da Avaliação */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{review.userName}</span>
              {review.verified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Compra Verificada
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Avaliação */}
      <div className="ml-13">
        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Ações */}
      <div className="ml-13 mt-4 flex items-center space-x-4">
        <button
          onClick={() => handleVote(true)}
          disabled={hasVoted !== null}
          className={`flex items-center space-x-1 text-sm ${
            hasVoted === 'helpful'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Útil ({review.helpful})</span>
        </button>
        
        <button
          onClick={() => handleVote(false)}
          disabled={hasVoted !== null}
          className={`flex items-center space-x-1 text-sm ${
            hasVoted === 'notHelpful'
              ? 'text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span>Não Útil ({review.notHelpful})</span>
        </button>
      </div>
    </div>
  );
}

interface ReviewListProps {
  reviews: Review[];
  onHelpful: (reviewId: number, isHelpful: boolean) => void;
}

export function ReviewList({ reviews, onHelpful }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [filterRating, setFilterRating] = useState<number>(0);

  // Filtrar e ordenar avaliações
  const filteredReviews = reviews
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="space-y-6">
      {/* Resumo das Avaliações */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Média e Estrelas */}
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Baseado em {reviews.length} avaliações
            </p>
          </div>

          {/* Distribuição de Estrelas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Distribuição</h4>
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por:</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={0}>Todas as avaliações</option>
            <option value={5}>5 estrelas</option>
            <option value={4}>4 estrelas</option>
            <option value={3}>3 estrelas</option>
            <option value={2}>2 estrelas</option>
            <option value={1}>1 estrela</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="date">Mais recentes</option>
            <option value="rating">Melhor avaliadas</option>
            <option value="helpful">Mais úteis</option>
          </select>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div>
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filterRating > 0 
                ? 'Nenhuma avaliação encontrada com essa classificação'
                : 'Nenhuma avaliação ainda. Seja o primeiro a avaliar!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onHelpful={onHelpful}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 