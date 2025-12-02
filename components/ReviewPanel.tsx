"use client";

import React, { useState, useEffect } from 'react';

export default function ReviewPanel({ targetId, onClose, onSubmit, reviews, establishments, initialView = 'form' }: any) {
  const [serviceRating, setServiceRating] = useState(0);
  const [waitTime, setWaitTime] = useState('');
  const [staffCount, setStaffCount] = useState('');
  const [comment, setComment] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasBathroom, setHasBathroom] = useState(false);
  const [hasPower, setHasPower] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'reviews'>(initialView);
  const [reviewsPage, setReviewsPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    console.log("ReviewPanel: targetId mudou para", targetId, "initialView:", initialView);
    
    setServiceRating(0);
    setWaitTime('');
    setStaffCount('');
    setComment('');
    setHasWater(false);
    setHasBathroom(false);
    setHasPower(false);
    
    setReviewsPage(1);
    
    setViewMode(initialView);
  }, [targetId, initialView]);

  useEffect(() => {
    console.log("ReviewPanel: initialView mudou para", initialView);
    setViewMode(initialView);
  }, [initialView]);

  if (!targetId) return null;

  const establishment = establishments.find((e: any) => e.id === targetId);
  
  const establishmentReviews = reviews?.filter((r: any) => r.establishment_id === targetId) || [];
  
  const sortedReviews = [...establishmentReviews].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
  
  const startIndex = (reviewsPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = sortedReviews.slice(0, endIndex);
  const hasMoreReviews = sortedReviews.length > endIndex;

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = {
      service_rating: serviceRating,
      wait_time: waitTime,
      staff_count: staffCount,
      comment: comment,
      has_water: hasWater,
      has_bathroom: hasBathroom,
      has_power: hasPower
    };
    
    console.log("Enviando avaliação para:", targetId, "dados:", formData);
    onSubmit(formData);
    
    setServiceRating(0);
    setWaitTime('');
    setStaffCount('');
    setComment('');
    setHasWater(false);
    setHasBathroom(false);
    setHasPower(false);
  };

  const handleStarClick = (rating: number) => {
    setServiceRating(rating);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= rating ? '#f59e0b' : '#d1d5db',
              fontSize: '16px'
            }}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const loadMoreReviews = () => {
    setReviewsPage(prev => prev + 1);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        margin: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            zIndex: 10
          }}
          title="Fechar"
        >
          ×
        </button>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{establishment?.name}</h2>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{establishment?.address}</div>
        </div>

        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 24
        }}>
          <button
            onClick={() => setViewMode('form')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: viewMode === 'form' ? '2px solid #3b82f6' : 'none',
              color: viewMode === 'form' ? '#3b82f6' : '#666',
              fontWeight: viewMode === 'form' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            📝 Nova Avaliação
          </button>
          <button
            onClick={() => setViewMode('reviews')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: viewMode === 'reviews' ? '2px solid #3b82f6' : 'none',
              color: viewMode === 'reviews' ? '#3b82f6' : '#666',
              fontWeight: viewMode === 'reviews' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: 14,
              position: 'relative'
            }}
          >
            👁️ Ver Avaliações
            {sortedReviews.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {sortedReviews.length}
              </span>
            )}
          </button>
        </div>

        {viewMode === 'form' && (
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Avaliação do atendimento:
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '32px',
                      cursor: 'pointer',
                      color: star <= serviceRating ? '#ffc107' : '#e4e5e9',
                      padding: 4
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                {serviceRating > 0 ? `Selecionado: ${serviceRating} estrela(s)` : 'Clique para avaliar'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Tempo de espera (minutos):
              </label>
              <input
                type="number"
                value={waitTime}
                onChange={(e) => setWaitTime(e.target.value)}
                min="0"
                max="480"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
                placeholder="Ex: 15"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Número de funcionários:
              </label>
              <input
                type="number"
                value={staffCount}
                onChange={(e) => setStaffCount(e.target.value)}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
                placeholder="Ex: 3"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Comentário (opcional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  resize: 'vertical',
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
                placeholder="Deixe seu comentário sobre o estabelecimento..."
              />
              <div style={{ fontSize: 12, color: '#666', textAlign: 'right', marginTop: 4 }}>
                {comment.length}/500 caracteres
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 'bold' }}>Infraestrutura disponível:</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasWater}
                    onChange={(e) => setHasWater(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  💧 Água disponível
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasBathroom}
                    onChange={(e) => setHasBathroom(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  🚻 Banheiro disponível
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hasPower}
                    onChange={(e) => setHasPower(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  🔌 Tomada disponível
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={serviceRating === 0}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: serviceRating === 0 ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  cursor: serviceRating === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                Enviar (moderação)
              </button>
            </div>
          </form>
        )}

        {viewMode === 'reviews' && (
          <div>
            {sortedReviews.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                  Nenhuma avaliação disponível
                </div>
                <div style={{ fontSize: 14 }}>
                  Este estabelecimento ainda não possui avaliações. Seja o primeiro a avaliar!
                </div>
                <button
                  onClick={() => setViewMode('form')}
                  style={{
                    marginTop: 20,
                    padding: '12px 24px',
                    background: '#ff8c42',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 14
                  }}
                >
                  📝 Criar Primeira Avaliação
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        Avaliações totais
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {sortedReviews.length}
                      </div>
                    </div>
                    {establishment?.final_score && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                          Média
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
                          {establishment.final_score.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                  Mostrando {paginatedReviews.length} de {sortedReviews.length} avaliações
                </div>

                {paginatedReviews.map((review: any, index: number) => (
                  <div
                    key={review.id || index}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: 16,
                      background: '#f9fafb'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: 12
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {renderStars(review.service_rating || review.rating)}
                          <span style={{ fontSize: 14, color: '#6b7280' }}>
                            {review.service_rating || review.rating} estrelas
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          {review.created_at ? formatDate(review.created_at) : 'Data não disponível'}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⏱️ {review.wait_time || 0} min
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          👥 {review.staff_count || 0} pessoas
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ 
                          padding: 12, 
                          background: 'white', 
                          borderRadius: 6,
                          borderLeft: '3px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: 14, color: '#4b5563', fontStyle: 'italic' }}>
                            "{review.comment}"
                          </div>
                        </div>
                      </div>
                    )}

                    {(review.has_water || review.has_bathroom || review.has_power) && (
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 8,
                        fontSize: 12,
                        color: '#6b7280'
                      }}>
                        {review.has_water && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4,
                            padding: '4px 8px',
                            background: '#eff6ff',
                            borderRadius: 4
                          }}>
                            💧 Água
                          </div>
                        )}
                        {review.has_bathroom && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4,
                            padding: '4px 8px',
                            background: '#f0fdf4',
                            borderRadius: 4
                          }}>
                            🚻 Banheiro
                          </div>
                        )}
                        {review.has_power && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 4,
                            padding: '4px 8px',
                            background: '#fef3c7',
                            borderRadius: 4
                          }}>
                            🔌 Tomada
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {hasMoreReviews && (
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <button
                      onClick={loadMoreReviews}
                      style={{
                        padding: '10px 20px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: 14
                      }}
                    >
                      📄 Ver mais {Math.min(reviewsPerPage, sortedReviews.length - paginatedReviews.length)} avaliações
                    </button>
                  </div>
                )}

                {!hasMoreReviews && sortedReviews.length > reviewsPerPage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 12,
                    color: '#6b7280',
                    fontSize: 12,
                    borderTop: '1px solid #e5e7eb',
                    marginTop: 8
                  }}>
                    Todas as avaliações foram carregadas
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                onClick={() => setViewMode('form')}
                style={{
                  padding: '12px 24px',
                  background: '#ff8c42',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                📝 Criar Nova Avaliação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}