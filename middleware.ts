import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Criar cliente Supabase para o middleware
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

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
    const adminRoutes = ["/admin"]

    // Verificar se a rota atual é protegida
    const isProtectedRoute = protectedRoutes.some((route) => requestUrl.pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some((route) => requestUrl.pathname.startsWith(route))

    // Se for uma rota protegida e não houver sessão, redirecionar para o login
    if (isProtectedRoute && !session) {
      console.log("Middleware - Redirecionando para login (rota protegida)")
      return NextResponse.redirect(redirectUrl)
    }

    // Se o usuário estiver autenticado, verificar se é admin
    if (session) {
      // Verificar se o usuário é admin
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      const isAdmin = profileData?.role === "admin"
      const isAdminEmail = session.user.email === "contato@dinoraw.com.br"

      // Se for uma rota de admin e o usuário não for admin, redirecionar para o dashboard
      if (isAdminRoute && !isAdmin && !isAdminEmail) {
        console.log("Middleware - Redirecionando para dashboard (usuário não é admin)")
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
      }

      // Se o usuário for admin e tentar acessar o dashboard, redirecionar para o admin
      if (requestUrl.pathname === "/dashboard" && (isAdmin || isAdminEmail)) {
        console.log("Middleware - Redirecionando para admin (usuário é admin)")
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      }

      // Se for a rota de login e houver sessão, redirecionar para o dashboard ou admin
      if (requestUrl.pathname === "/login" && request.method === "GET") {
        if (isAdmin || isAdminEmail) {
          console.log("Middleware - Redirecionando para admin (usuário é admin)")
          return NextResponse.redirect(new URL("/admin", requestUrl.origin))
        } else {
          console.log("Middleware - Redirecionando para dashboard (usuário normal)")
          return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
        }
      }
    }

    // Continuar com a requisição normalmente
    return res
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
