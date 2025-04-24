import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Criar cliente Supabase para o middleware
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

    // Verificar se há uma sessão válida
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // URL atual e URL de destino
    const requestUrl = new URL(request.url)
    const redirectUrl = new URL("/login", requestUrl.origin)

    // Adicionar parâmetro redirectTo para retornar após o login
    redirectUrl.searchParams.set("redirectTo", requestUrl.pathname)

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = ["/dashboard", "/calculators", "/admin"]

    // Verificar se a rota atual é protegida
    const isProtectedRoute = protectedRoutes.some((route) => requestUrl.pathname.startsWith(route))

    // Se for uma rota protegida e não houver sessão, redirecionar para o login
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(redirectUrl)
    }

    // Se for a rota de login e houver sessão, redirecionar para o dashboard
    if (requestUrl.pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    }

    // Continuar com a requisição normalmente
    return NextResponse.next()
  } catch (error) {
    console.error("Erro no middleware:", error)
    // Em caso de erro, permitir que a requisição continue
    return NextResponse.next()
  }
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/dashboard/:path*", "/calculators/:path*", "/admin/:path*", "/login"],
}
