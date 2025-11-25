"use client";

import React, { useState } from 'react';

export default function AddEstablishmentModal({ clickedPos, onCancel, onConfirm }: any) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasBathroom, setHasBathroom] = useState(false);
  const [hasPower, setHasPower] = useState(false);
  const [wantToReview, setWantToReview] = useState(false);
  
  // Estados para a avaliação
  const [serviceRating, setServiceRating] = useState(0);
  const [waitTime, setWaitTime] = useState('');
  const [staffCount, setStaffCount] = useState('');
  const [comment, setComment] = useState('');
  const [reviewHasWater, setReviewHasWater] = useState(false);
  const [reviewHasBathroom, setReviewHasBathroom] = useState(false);
  const [reviewHasPower, setReviewHasPower] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Por favor, preencha o nome do estabelecimento.');
      return;
    }

    const flags = {
      has_water: hasWater,
      has_bathroom: hasBathroom,
      has_power: hasPower
    };

    let reviewData = null;
    if (wantToReview) {
      if (serviceRating === 0) {
        alert('Por favor, avalie o atendimento com as estrelas.');
        return;
      }
      reviewData = {
        service_rating: serviceRating,
        wait_time: waitTime,
        staff_count: staffCount,
        comment: comment,
        has_water: reviewHasWater,
        has_bathroom: reviewHasBathroom,
        has_power: reviewHasPower
      };
    }

    onConfirm(name, address, flags, wantToReview, reviewData);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 'bold' }}>Adicionar Estabelecimento</h2>
      
      {clickedPos && (
        <div style={{ 
          background: '#f0f9ff', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #bae6fd'
        }}>
          <strong>📍 Local selecionado:</strong>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            Lat: {clickedPos.lat.toFixed(6)}, Lng: {clickedPos.lng.toFixed(6)}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Nome do estabelecimento *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            placeholder="Ex: Padaria do Zé"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Endereço (opcional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            placeholder="Ex: Rua das Flores, 123"
          />
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={wantToReview}
              onChange={(e) => setWantToReview(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            Também quero enviar uma avaliação agora
          </label>
        </div>

        {wantToReview && (
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 16,
            background: '#f9fafb'
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Avaliação do Estabelecimento</h3>
            
            {/* 🔥 AVALIAÇÃO COM ESTRELAS - IGUAL AO REVIEWPANEL */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Avaliação do atendimento *
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setServiceRating(star)}
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

            <div style={{ marginBottom: 8 }}>
              <h4 style={{ marginBottom: 12, fontWeight: 'bold' }}>Infraestrutura disponível (na sua experiência):</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reviewHasWater}
                    onChange={(e) => setReviewHasWater(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  💧 Água disponível
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reviewHasBathroom}
                    onChange={(e) => setReviewHasBathroom(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  🚻 Banheiro disponível
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reviewHasPower}
                    onChange={(e) => setReviewHasPower(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  🔌 Tomada disponível
                </label>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            type="button"
            onClick={onCancel}
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
            disabled={!name.trim()}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: !name.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: 14
            }}
          >
            Enviar para moderação
          </button>
        </div>
      </form>
    </div>
  );
}