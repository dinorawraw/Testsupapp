import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Cria um cliente Supabase específico para o middleware
  const supabase = createMiddlewareClient({
    req,
    res,
    supabaseUrl: "https://lmtxihtbvsfszywrzgeh.supabase.co",
    supabaseKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHhpaHRidnNmc3p5d3J6Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzY4NjksImV4cCI6MjA1OTYxMjg2OX0.Moi9zFo9l0TJV-0ueTC51BPj_HAFQoB3PKVsqmcoZ8U",
  })

  // Obter a sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard", "/admin", "/payment"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Rotas de autenticação (login/registro)
  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Adicionar log para debug
  console.log("Middleware - URL:", req.nextUrl.pathname)
  console.log("Middleware - Sessão existe:", !!session)
  console.log("Middleware - É rota protegida:", isProtectedRoute)
  console.log("Middleware - É rota de auth:", isAuthRoute)

  // Redirecionar usuários não autenticados para login
  if (isProtectedRoute && !session) {
    console.log("Middleware - Redirecionando para login (rota protegida)")
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar usuários autenticados para dashboard se tentarem acessar login/registro
  if (isAuthRoute && session) {
    console.log("Middleware - Redirecionando para dashboard (usuário já autenticado)")
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

// Modificar o matcher para evitar loops de redirecionamento
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/payment/:path*", "/login", "/register"],
}
