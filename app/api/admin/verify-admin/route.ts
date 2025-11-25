// app/api/admin/verify-admin/route.ts
import { NextResponse } from "next/server";

// 🔒 LISTA SEGURA DE ADMINS - Configure no .env.local
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: "Email é obrigatório" 
      }, { status: 400 });
    }

    // 🔒 VALIDAÇÃO SEGURA - Verificar contra lista fixa
    const isAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase());
    
    // 🔒 LOG DE TENTATIVAS (em produção, salvar em banco de logs)
    console.log(`Tentativa de verificação admin: ${email} - ${isAdmin ? 'APROVADO' : 'NEGADO'}`);

    return NextResponse.json({ 
      isAdmin,
      // Não revele quais emails são admins mesmo em sucesso
      message: isAdmin ? "Email verificado" : "Acesso negado"
    });

  } catch (error) {
    console.error("Erro na verificação admin:", error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}