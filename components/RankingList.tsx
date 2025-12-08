"use client";

export default function RankingList({ establishments = [], reviews = [] }: any) {
  function computeFinalScoreFromReview(r:any){
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

  const byId: Record<string, number[]> = {};
  for (const r of reviews) {
    const s = computeFinalScoreFromReview(r);
    if (!byId[r.establishment_id]) byId[r.establishment_id] = [];
    byId[r.establishment_id].push(s);
  }

  const enriched = establishments.map((e:any)=>{
    const arr = byId[e.id] || [];
    const avg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
    return { ...e, final_score: avg, reviews_count: arr.length };
  });

  // Filtra apenas estabelecimentos com 2 ou mais avaliações
  const filtered = enriched.filter((e: any) => e.reviews_count >= 2);

  const sorted = filtered.slice().sort((a:any,b:any)=> {
    const scoreA = a.final_score ?? 9999;
    const scoreB = b.final_score ?? 9999;
    return scoreA - scoreB;
  });

  const top10Worst = sorted.slice(0, 10);

  return (
    <div style={{ padding:16, paddingBottom:120 }}>
      <h2 style={{ marginTop:0 }}>Ranking — Piores estabelecimentos</h2>
      
      {top10Worst.length === 0 && (
        <div className="small">
          {enriched.length === 0 
            ? "Sem estabelecimentos cadastrados." 
            : "Nenhum estabelecimento com mais de 1 avaliação."}
        </div>
      )}
      
      {top10Worst.length < 10 && top10Worst.length > 0 && (
        <div className="small" style={{ marginBottom: 12 }}>
          Mostrando {top10Worst.length} estabelecimento(s) disponível(is) com mais de 1 avaliação
        </div>
      )}
      
      {top10Worst.length > 0 && (
        <div className="small" style={{ marginBottom: 12 }}>
          Apenas estabelecimentos com 2 ou mais avaliações são considerados no ranking
        </div>
      )}
      
      {top10Worst.map((e:any)=>(
        <div key={e.id} className="card" style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div>
              <strong>{e.name}</strong>
              <div className="small">{e.address}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:700 }}>{e.final_score ? (e.final_score as number).toFixed(2) : "—"}</div>
              <div className="small">{e.reviews_count || 0} avaliações</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}