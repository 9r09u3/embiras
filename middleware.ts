// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 🔒 Apenas aplicar headers de segurança para rotas administrativas
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    const response = NextResponse.next()
    
    // Headers de segurança
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    
    return response
  }

  return NextResponse.next()
}

// 🔒 Especificar as rotas que devem acionar o middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}