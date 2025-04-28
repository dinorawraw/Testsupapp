import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const plan = requestUrl.searchParams.get("plan") || "free"
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Trocar o código por uma sessão
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Erro ao trocar código por sessão:", error)
      return NextResponse.redirect(new URL(`/login?error=${error.message}`, requestUrl.origin))
    }

    // Verificar se o usuário já tem um perfil
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user?.id)
      .single()

    // Se não tiver perfil, criar um
    if (profileError && profileError.code === "PGRST116") {
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: data.user?.id,
          full_name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || "Usuário",
          role: "user",
        },
      ])

      if (insertError) {
        console.error("Erro ao criar perfil:", insertError)
      }
    }

    // Verificar se o usuário é admin
    const isAdmin = profileData?.role === "admin" || data.user?.email === "contato@dinoraw.com.br"

    // Redirecionar com base no plano e no papel do usuário
    if (plan === "premium" && !isAdmin) {
      return NextResponse.redirect(new URL("/payment", requestUrl.origin))
    } else if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", requestUrl.origin))
    } else {
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  // Se não houver código, redirecionar para a página inicial
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
