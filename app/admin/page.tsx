// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [pendingEsts, setPendingEsts] = useState<any[]>([]);
  const [pendingRvs, setPendingRvs] = useState<any[]>([]);
  const [tab, setTab] = useState<"establishments"|"reviews">("establishments");
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(()=>{
    checkAndSetUser();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
      await checkAndSetUser(session?.user);
    });
    return () => sub.subscription.unsubscribe();
  },[]);

  // 🔒 FUNÇÃO CRÍTICA - Verifica se usuário é admin com mais validações
  async function checkAndSetUser(sessionUser?: any) {
    const userToCheck = sessionUser || (await supabase.auth.getSession()).data.session?.user;
    
    if (!userToCheck) {
      setUser(null);
      return;
    }

    // 🔒 VALIDAÇÃO ADICIONAL: Verificar se o email está presente
    if (!userToCheck.email) {
      console.warn('Usuário sem email tentou acessar admin');
      await supabase.auth.signOut();
      setUser(null);
      return;
    }

    // 🔒 VERIFICAR SE O EMAIL É ADMIN
    try {
      const response = await fetch('/api/admin/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userToCheck.email })
      });

      // 🔒 VERIFICAR SE A RESPOSTA É VÁLIDA
      if (!response.ok) {
        throw new Error('Erro na verificação de admin');
      }

      const result = await response.json();
      
      if (result.isAdmin) {
        setUser(userToCheck);
      } else {
        console.warn(`🚨 Usuário não autorizado tentou acessar: ${userToCheck.email}`);
        await supabase.auth.signOut();
        setUser(null);
        
        // 🔒 Mensagem genérica sem revelar detalhes
        if (typeof window !== 'undefined') {
          alert("Acesso não autorizado.");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      await supabase.auth.signOut();
      setUser(null);
      
      if (typeof window !== 'undefined') {
        alert("Erro de verificação. Tente novamente.");
      }
    }
  }
  // 🔒 FUNÇÃO DE LOGIN SEGURA - Só envia magic link para admins
  async function signIn() {
    const email = prompt("Email do admin:");
    if (!email) return;
    
    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Por favor, insira um email válido.");
      return;
    }

    try {
      // 🔒 VERIFICAR SE É ADMIN ANTES DE ENVIAR MAGIC LINK
      const response = await fetch('/api/admin/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      // 🔒 CRÍTICO: Só envia magic link se for admin
      if (!result.isAdmin) {
        alert("Se este email estiver cadastrado como administrador, você receberá um link de acesso em alguns instantes. Verifique sua caixa de entrada e spam.");
        return;
      }

      // 🔒 Só enviar magic link para emails autorizados
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });
      
      if (error) {
        console.error("Erro de login:", error);
        alert("Erro ao enviar link de acesso. Tente novamente.");
        return;
      }
      
      alert("Link de acesso enviado para seu email. Verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro no processo de login:", error);
      alert("Erro no processo de login. Tente novamente.");
    }
  }

  async function signOut() { 
    await supabase.auth.signOut(); 
    setUser(null); 
  }

  // 🔒 CARREGAMENTO SEGURO DE DADOS PENDENTES
  async function loadPending(){
    if (!user) return;
    
    setLoading(true);
    try {
      const [{ data: ests, error: e1 }, { data: rvs, error: e2 }] = await Promise.all([
        supabase.from("pending_establishments").select("*").order("created_at",{ascending:true}).limit(100),
        supabase.from("reviews").select("*, establishments(name)").eq("approved", false).order("created_at",{ascending:true}).limit(100)
      ]);
      
      if(e1) {
        console.error("Erro ao carregar estabelecimentos:", e1);
        alert("Erro ao carregar estabelecimentos pendentes.");
      }
      if(e2) {
        console.error("Erro ao carregar avaliações:", e2);
        alert("Erro ao carregar avaliações pendentes.");
      }
      
      setPendingEsts(ests || []);
      setPendingRvs(rvs || []);
    } catch (error) {
      console.error("Erro inesperado:", error);
      alert("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=> { 
    if(user) loadPending(); 
    else { 
      setPendingEsts([]); 
      setPendingRvs([]); 
    } 
  }, [user]);

  // 🔒 FUNÇÃO SEGURA PARA APROVAR ESTABELECIMENTO
  async function approveEst(pendingId: string){
    if (actionInProgress) return;
    setActionInProgress(`approve-est-${pendingId}`);
    
    if(!confirm("Deseja aprovar este estabelecimento?")) {
      setActionInProgress(null);
      return;
    }

    try {
      // 🔒 Verificação adicional via API
      const response = await fetch('/api/admin/approve-establishment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ 
          pendingId,
          userEmail: user.email 
        })
      });

      if (!response.ok) {
        throw new Error('Erro de autorização');
      }

      const result = await response.json();
      
      if (result.success) {
        alert("Estabelecimento aprovado com sucesso!");
        await loadPending();
      } else {
        alert("Erro ao aprovar estabelecimento: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao aprovar estabelecimento:", error);
      alert("Erro ao aprovar estabelecimento. Tente novamente.");
    } finally {
      setActionInProgress(null);
    }
  }

  // 🔒 FUNÇÃO SEGURA PARA REJEITAR ESTABELECIMENTO
  async function rejectEst(pendingId: string){
    if (actionInProgress) return;
    setActionInProgress(`reject-est-${pendingId}`);
    
    const reason = prompt("Motivo da rejeição (opcional):") || "Sem motivo especificado";
    if (reason === null) {
      setActionInProgress(null);
      return; // Usuário cancelou
    }

    if(!confirm("Deseja realmente rejeitar este estabelecimento?")) {
      setActionInProgress(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("pending_establishments")
        .delete()
        .eq("id", pendingId);

      if(error) throw error;

      // 🔒 Log da ação (em produção, salvar em tabela de logs)
      console.log(`Estabelecimento ${pendingId} rejeitado por ${user.email}. Motivo: ${reason}`);
      
      alert("Estabelecimento rejeitado.");
      await loadPending();
    } catch (error) {
      console.error("Erro ao rejeitar estabelecimento:", error);
      alert("Erro ao rejeitar estabelecimento. Tente novamente.");
    } finally {
      setActionInProgress(null);
    }
  }

  // 🔒 FUNÇÃO SEGURA PARA APROVAR AVALIAÇÃO
  async function approveReview(reviewId: string){
    if (actionInProgress) return;
    setActionInProgress(`approve-review-${reviewId}`);
    
    if(!confirm("Deseja aprovar esta avaliação?")) {
      setActionInProgress(null);
      return;
    }

    try {
      const moderator = user?.email ?? "admin";
      const { error } = await supabase
        .from("reviews")
        .update({ 
          approved: true, 
          moderated_by: moderator, 
          moderated_at: new Date().toISOString() 
        })
        .eq("id", reviewId);

      if(error) throw error;

      alert("Avaliação aprovada.");
      await loadPending();
    } catch (error) {
      console.error("Erro ao aprovar avaliação:", error);
      alert("Erro ao aprovar avaliação. Tente novamente.");
    } finally {
      setActionInProgress(null);
    }
  }

  // 🔒 FUNÇÃO SEGURA PARA REJEITAR AVALIAÇÃO
  async function rejectReview(reviewId: string){
    if (actionInProgress) return;
    setActionInProgress(`reject-review-${reviewId}`);
    
    const reason = prompt("Motivo da rejeição:") || "Sem motivo especificado";
    if (reason === null) {
      setActionInProgress(null);
      return;
    }

    if(!confirm("Deseja realmente rejeitar esta avaliação?")) {
      setActionInProgress(null);
      return;
    }

    try {
      const moderator = user?.email ?? "admin";
      const { error } = await supabase
        .from("reviews")
        .update({ 
          approved: false, 
          moderated_by: moderator, 
          moderated_at: new Date().toISOString(), 
          moderator_note: reason 
        })
        .eq("id", reviewId);

      if(error) throw error;

      alert("Avaliação rejeitada.");
      await loadPending();
    } catch (error) {
      console.error("Erro ao rejeitar avaliação:", error);
      alert("Erro ao rejeitar avaliação. Tente novamente.");
    } finally {
      setActionInProgress(null);
    }
  }

  if(!user){
    return (
      <div style={{ padding:20, maxWidth: 600, margin: '0 auto' }}>
        <h2>Painel Administrativo</h2>
        <p style={{ marginBottom: 16 }}>Acesso restrito a administradores autorizados.</p>
        <button 
          onClick={signIn}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Entrar com Email
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:16, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap: 'wrap', gap: 12 }}>
        <h2>Painel Administrativo</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#666' }}>Conectado: {user.email}</span>
          <button 
            onClick={signOut}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ marginTop:20, display:"flex", gap:8, flexWrap: 'wrap' }}>
        <button 
          onClick={()=>setTab("establishments")} 
          style={{ 
            padding: '12px 20px', 
            background: tab==="establishments" ? "#10b981" : "#6b7280", 
            color:"#fff", 
            border:"none", 
            borderRadius:8,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Estabelecimentos Pendentes ({pendingEsts.length})
        </button>
        <button 
          onClick={()=>setTab("reviews")} 
          style={{ 
            padding: '12px 20px', 
            background: tab==="reviews" ? "#10b981" : "#6b7280", 
            color:"#fff", 
            border:"none", 
            borderRadius:8,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Avaliações Pendentes ({pendingRvs.length})
        </button>
        <button 
          onClick={loadPending} 
          disabled={loading}
          style={{ 
            marginLeft:"auto", 
            padding: '12px 20px',
            background: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      <div style={{ marginTop:24 }}>
        {tab==="establishments" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Estabelecimentos Pendentes de Aprovação</h3>
            {pendingEsts.length===0 && (
              <div style={{ 
                padding: 40, 
                textAlign: 'center', 
                color: '#6b7280',
                background: '#f9fafb',
                borderRadius: 8
              }}>
                Nenhum estabelecimento pendente.
              </div>
            )}
            {pendingEsts.map(p=>(
              <div key={p.id} style={{ 
                background: 'white', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>{p.name}</strong>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>{p.address || 'Sem endereço'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      Posição: {p.lat?.toFixed(6)}, {p.lng?.toFixed(6)} • 
                      Enviado em: {new Date(p.created_at).toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                      {p.has_water && '💧 '}
                      {p.has_bathroom && '🚻 '}
                      {p.has_power && '🔌 '}
                    </div>
                  </div>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ marginBottom: 12, textAlign: 'right' }}>
                      <button 
                        onClick={()=>approveEst(p.id)} 
                        disabled={actionInProgress === `approve-est-${p.id}`}
                        style={{ 
                          marginRight:8, 
                          padding:"10px 16px", 
                          background: actionInProgress === `approve-est-${p.id}` ? "#9ca3af" : "#10b981", 
                          color:"#fff", 
                          border:"none", 
                          borderRadius:6,
                          cursor: actionInProgress === `approve-est-${p.id}` ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {actionInProgress === `approve-est-${p.id}` ? 'Aprovando...' : 'Aprovar'}
                      </button>
                      <button 
                        onClick={()=>rejectEst(p.id)} 
                        disabled={actionInProgress === `reject-est-${p.id}`}
                        style={{ 
                          padding:"10px 16px", 
                          background: actionInProgress === `reject-est-${p.id}` ? "#9ca3af" : "#ef4444", 
                          color:"#fff", 
                          border:"none", 
                          borderRadius:6,
                          cursor: actionInProgress === `reject-est-${p.id}` ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionInProgress === `reject-est-${p.id}` ? 'Rejeitando...' : 'Rejeitar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="reviews" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Avaliações Pendentes de Moderação</h3>
            {pendingRvs.length===0 && (
              <div style={{ 
                padding: 40, 
                textAlign: 'center', 
                color: '#6b7280',
                background: '#f9fafb',
                borderRadius: 8
              }}>
                Nenhuma avaliação pendente.
              </div>
            )}
            {pendingRvs.map(r=>(
              <div key={r.id} style={{ 
                background: 'white', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                      Estabelecimento: {r.establishments?.name || `ID: ${r.establishment_id || "Pendente"}`}
                    </strong>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                      {r.comment || 'Sem comentário'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      ⭐ {r.service_rating ?? r.rating} • ⏱️ {r.wait_time} min • 👥 {r.staff_count} func.
                      {r.has_water && ' • 💧'}
                      {r.has_bathroom && ' • 🚻'}
                      {r.has_power && ' • 🔌'}
                    </div>
                    {r.moderator_note && (
                      <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                        Observação: {r.moderator_note}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                      Enviado em: {new Date(r.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ marginBottom: 12, textAlign: 'right' }}>
                      <button 
                        onClick={()=>approveReview(r.id)} 
                        disabled={actionInProgress === `approve-review-${r.id}`}
                        style={{ 
                          marginRight:8, 
                          padding:"10px 16px", 
                          background: actionInProgress === `approve-review-${r.id}` ? "#9ca3af" : "#10b981", 
                          color:"#fff", 
                          border:"none", 
                          borderRadius:6,
                          cursor: actionInProgress === `approve-review-${r.id}` ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {actionInProgress === `approve-review-${r.id}` ? 'Aprovando...' : 'Aprovar'}
                      </button>
                      <button 
                        onClick={()=>rejectReview(r.id)} 
                        disabled={actionInProgress === `reject-review-${r.id}`}
                        style={{ 
                          padding:"10px 16px", 
                          background: actionInProgress === `reject-review-${r.id}` ? "#9ca3af" : "#ef4444", 
                          color:"#fff", 
                          border:"none", 
                          borderRadius:6,
                          cursor: actionInProgress === `reject-review-${r.id}` ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionInProgress === `reject-review-${r.id}` ? 'Rejeitando...' : 'Rejeitar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}