"use client";

import React, { useState } from 'react';

export default function ReviewPanel({ targetId, onClose, onSubmit, reviews, establishments }: any) {
  const [serviceRating, setServiceRating] = useState(0);
  const [waitTime, setWaitTime] = useState('');
  const [staffCount, setStaffCount] = useState('');
  const [comment, setComment] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasBathroom, setHasBathroom] = useState(false);
  const [hasPower, setHasPower] = useState(false);

  if (!targetId) return null;

  const establishment = establishments.find((e: any) => e.id === targetId);

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
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 'bold' }}>Avaliar {establishment?.name}</h2>
        
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
      </div>
    </div>
  );
}