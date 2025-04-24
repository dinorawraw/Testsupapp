import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Cria um cliente Supabase específico para o middleware
    const supabase = createMiddlewareClient({ req, res })

    // Obter a sessão atual
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = ["/dashboard", "/admin", "/payment", "/calculators"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Rotas de autenticação (login/registro)
    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname === route)

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
  } catch (error) {
    console.error("Erro no middleware:", error)
    return res
  }
}

// Modificar o matcher para evitar loops de redirecionamento
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/payment/:path*", "/calculators/:path*", "/login", "/register"],
}
