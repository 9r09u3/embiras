"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import TabBar from "../components/TabBar";
import AddEstablishmentModal from "../components/AddEstablishmentModal";
import ReviewPanel from "../components/ReviewPanel";
import RankingList from "../components/RankingList";

interface Position {
  lat: number;
  lng: number;
}

interface Establishment {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  has_water: boolean;
  has_bathroom: boolean;
  has_power: boolean;
  final_score: number | null;
  reviews_count: number;
  [key: string]: any;
}

interface Review {
  id: string;
  establishment_id: string;
  rating: number;
  service_rating: number;
  comment: string;
  has_water: boolean;
  has_bathroom: boolean;
  has_power: boolean;
  staff_count: number;
  wait_time: number;
  approved: boolean;
  [key: string]: any;
}

interface Filters {
  has_water: boolean;
  has_bathroom: boolean;
  has_power: boolean;
}

interface ReviewFormData {
  service_rating: number;
  comment?: string;
  has_water: boolean;
  has_bathroom: boolean;
  has_power: boolean;
  staff_count: number;
  wait_time: number;
}

interface EstablishmentFlags {
  has_water: boolean;
  has_bathroom: boolean;
  has_power: boolean;
}

const LeafletMap = dynamic(() => import("../components/LeafletMap"), { 
  ssr: false,
  loading: () => <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando mapa...</div>
});

function computeFinalScoreFromReview(r: any): number {
  const service = Number(r.service_rating ?? r.rating ?? 0);
  const wait_time = Number(r.wait_time ?? 0);

  let wait_score = 1;
  if (wait_time <= 5) wait_score = 5;
  else if (wait_time <= 10) wait_score = 3;
  else wait_score = 1;

  const infraCount = [r.has_water, r.has_bathroom, r.has_power].filter(Boolean).length;
  let infra_score = 1;
  if (infraCount === 0) infra_score = 1;
  else if (infraCount === 1) infra_score = 2;
  else if (infraCount === 2) infra_score = 3;
  else infra_score = 5;

  const finalScore = service * 0.6 + wait_score * 0.3 + infra_score * 0.1;
  return Number.isFinite(finalScore) ? finalScore : 0;
}

export default function Page() {
  const [tab, setTab] = useState<"map" | "ranking">("map");
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Position | null>(null);
  const [addMode, setAddMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Establishment[]>([]);

  const [filters, setFilters] = useState<Filters>({ has_water: false, has_bathroom: false, has_power: false });
  const [reviewTarget, setReviewTarget] = useState<string | null>(null);

  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

  async function loadAll() {
    try {
      const [{ data: estData, error: estError }, { data: revData, error: revError }] = await Promise.all([
        supabase.from("establishments").select("*"),
        supabase.from("reviews").select("*").eq("approved", true)
      ]);

      if (estError) throw estError;
      if (revError) throw revError;

      const revs = revData || [];
      setReviews(revs);

      const byId: Record<string, number[]> = {};
      const byCount: Record<string, number> = {};

      for (const r of revs) {
        const s = computeFinalScoreFromReview(r);
        if (!byId[r.establishment_id]) byId[r.establishment_id] = [];
        byId[r.establishment_id].push(s);
        byCount[r.establishment_id] = (byCount[r.establishment_id] || 0) + 1;
      }

      const enriched = (estData || []).map((e: any) => {
        const arr = byId[e.id] || [];
        const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
        return { ...e, final_score: avg, reviews_count: byCount[e.id] || 0 };
      });

      setEstablishments(enriched);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => { 
    loadAll(); 
  }, []);

  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const s = establishments.filter(e => e.name?.toLowerCase().includes(q));
    setSuggestions(s.slice(0, 8));
  }, [searchQuery, establishments]);

  const handleSuggestionClick = useCallback((establishment: Establishment) => {
    if (!establishment) return;
    
    setTab("map");
    setSearchQuery("");
    setSuggestions([]);
    
    setTimeout(() => {
      setSelectedEstablishment(establishment);
    }, 100);
  }, []);

  useEffect(() => {
    if (selectedEstablishment) {
      const timer = setTimeout(() => {
        setSelectedEstablishment(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedEstablishment]);

  const submitPendingEstablishmentAndOptionalReview = async (
    name: string, 
    address: string, 
    flags: EstablishmentFlags, 
    wantToReview: boolean, 
    reviewData?: ReviewFormData
  ): Promise<void> => {
    if (!selectedPoint) {
      alert("Marque a posição no mapa antes de enviar.");
      return;
    }

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      alert("Nome do estabelecimento deve ter entre 2 e 100 caracteres.");
      return;
    }

    try {
      console.log("Iniciando envio do estabelecimento...");
      
      const pendingData = {
        name: name.trim(),
        address: address ? address.trim().slice(0, 200) : "",
        lat: Number(selectedPoint.lat),
        lng: Number(selectedPoint.lng),
        has_water: Boolean(flags?.has_water),
        has_bathroom: Boolean(flags?.has_bathroom),
        has_power: Boolean(flags?.has_power),
        submitted_by: "public"
      };

      console.log("Dados do estabelecimento:", pendingData);

      const { data: establishmentData, error: establishmentError } = await supabase
        .from("pending_establishments")
        .insert([pendingData])
        .select()
        .single();

      if (establishmentError) {
        console.error("Erro ao inserir estabelecimento:", establishmentError);
        throw new Error(`Erro no estabelecimento: ${establishmentError.message}`);
      }

      console.log("Estabelecimento inserido com sucesso:", establishmentData);

      if (wantToReview && reviewData) {
        console.log("Preparando para enviar review...");
        
        if (!reviewData.service_rating || reviewData.service_rating === 0) {
          alert("Estabelecimento enviado, mas a avaliação precisa de uma classificação com estrelas.");
          setSelectedPoint(null);
          setAddMode(false);
          return;
        }

        const reviewPayload = {
          establishment_id: null,
          rating: Number(reviewData.service_rating),
          service_rating: Number(reviewData.service_rating),
          comment: String(reviewData.comment || "").slice(0, 500),
          has_water: Boolean(reviewData.has_water),
          has_bathroom: Boolean(reviewData.has_bathroom),
          has_power: Boolean(reviewData.has_power),
          staff_count: Math.max(0, Math.min(100, Number(reviewData.staff_count || 0))),
          wait_time: Math.max(0, Math.min(480, Number(reviewData.wait_time || 0))),
          approved: false,
          moderator_note: `pending_establishment_id:${establishmentData.id}`
        };

        console.log("Dados da review:", reviewPayload);

        const { error: reviewError } = await supabase
          .from("reviews")
          .insert([reviewPayload]);

        if (reviewError) {
          console.error("Erro ao inserir review:", reviewError);
          alert("Estabelecimento enviado para moderação, mas houve um erro ao enviar a avaliação.");
        } else {
          console.log("Review inserida com sucesso");
          alert("Obrigado! Estabelecimento e avaliação enviados para moderação.");
        }
      } else {
        alert("Obrigado! Estabelecimento enviado para moderação.");
      }

      setSelectedPoint(null);
      setAddMode(false);
      
    } catch (error: any) {
      console.error("Erro detalhado no processo:", error);
      alert(`Erro ao enviar: ${error.message || "Tente novamente."}`);
    }
  };

  const handleSubmitReviewForApproved = async (formData: ReviewFormData): Promise<void> => {
    if (!reviewTarget) {
      alert("Estabelecimento não selecionado.");
      return;
    }

    try {
      console.log("Iniciando envio da review...");
      console.log("Dados recebidos:", formData);
      
      if (!formData.service_rating || formData.service_rating === 0) {
        alert("Por favor, avalie o atendimento com as estrelas.");
        return;
      }

      const payload = {
        establishment_id: reviewTarget,
        rating: Number(formData.service_rating),
        service_rating: Number(formData.service_rating),
        wait_time: Math.max(0, Math.min(480, Number(formData.wait_time || 0))),
        staff_count: Math.max(0, Math.min(100, Number(formData.staff_count || 0))),
        comment: String(formData.comment || "").slice(0, 500),
        has_water: Boolean(formData.has_water),
        has_bathroom: Boolean(formData.has_bathroom),
        has_power: Boolean(formData.has_power),
        approved: false
      };

      console.log("Payload da review:", payload);

      const { error } = await supabase
        .from("reviews")
        .insert([payload]);

      if (error) {
        console.error("Erro do Supabase:", error);
        alert(`Erro ao enviar avaliação: ${error.message}`);
        return;
      }

      console.log("Review enviada com sucesso!");
      alert("Avaliação enviada para moderação!");
      setReviewTarget(null);
      
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      alert(`Erro inesperado: ${error.message || "Tente novamente."}`);
    }
  };

  function getFilteredList(): Establishment[] {
    let list = establishments.slice();
    if (filters.has_water) list = list.filter(e => e.has_water);
    if (filters.has_bathroom) list = list.filter(e => e.has_bathroom);
    if (filters.has_power) list = list.filter(e => e.has_power);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(e => e.name?.toLowerCase().includes(q));
    }

    return list;
  }

  const rankingMapped = [...establishments]
    .map(e => ({ ...e, sortScore: e.final_score ?? 999 }))
    .sort((a, b) => a.sortScore - b.sortScore);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {tab === "map" && (
        <>
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, background: "white", borderRadius: 12, padding: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: 340, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                style={{ 
                  flex: 1, 
                  padding: "10px 12px", 
                  border: "1px solid #ddd", 
                  borderRadius: 8, 
                  fontSize: 14,
                  outline: "none"
                }}
                placeholder="Buscar estabelecimento..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!searchQuery.trim()) return;
                  const first = suggestions[0];
                  if (first) handleSuggestionClick(first);
                }}
                style={{ 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: "none", 
                  background: "#ff8c42", 
                  color: "white", 
                  cursor: "pointer"
                }}
              >
                🔍
              </button>
            </div>

            {suggestions.length > 0 && (
              <div style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                {suggestions.map((s: Establishment) => (
                  <div
                    key={s.id}
                    onClick={() => handleSuggestionClick(s)}
                    style={{ 
                      padding: "12px", 
                      cursor: "pointer", 
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{s.address}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <button
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: 10, 
                  border: "none", 
                  background: "#ff8c42", 
                  color: "white", 
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => setAddMode(true)}
              >
                ➕ Adicionar estabelecimento
              </button>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
              <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: "bold" }}>Filtros</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.has_water}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, has_water: e.target.checked }))} 
                  /> 
                  💧 Água
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.has_bathroom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, has_bathroom: e.target.checked }))} 
                  /> 
                  🚻 Banheiro
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.has_power}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, has_power: e.target.checked }))} 
                  /> 
                  🔌 Tomada
                </label>
              </div>
            </div>
          </div>

          <LeafletMap
            establishments={getFilteredList()}
            selectedPoint={selectedPoint}
            onMapClick={(pos: Position) => setSelectedPoint(pos)}
            onRequestReview={(id: string) => setReviewTarget(id)}
            selectedEstablishment={selectedEstablishment}
            onEstablishmentOpened={() => setSelectedEstablishment(null)}
          />
        </>
      )}

      {tab === "ranking" && <RankingList establishments={rankingMapped} reviews={reviews} />}

      <TabBar active={tab} onChange={(newTab: "map" | "ranking") => setTab(newTab)} />

      {addMode && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }} onClick={() => setAddMode(false)}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }} onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <AddEstablishmentModal
              clickedPos={selectedPoint}
              onCancel={() => setAddMode(false)}
              onConfirm={submitPendingEstablishmentAndOptionalReview}
            />
          </div>
        </div>
      )}

      <ReviewPanel
        targetId={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReviewForApproved}
        reviews={reviews}
        establishments={establishments}
      />
    </div>
  );
}