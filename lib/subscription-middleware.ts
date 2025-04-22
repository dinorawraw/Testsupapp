import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function checkSubscription(req: NextRequest) {
  // Criar cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    },
  )

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { isSubscribed: false, user: null }
  }

  try {
    // Verificar se a tabela de assinaturas existe
    const { error: tableError } = await supabase.from("subscriptions").select("count").limit(1)

    if (tableError) {
      console.log("A tabela de assinaturas pode não existir ainda:", tableError)
      return { isSubscribed: false, user: session.user }
    }

    // Verificar se o usuário tem uma assinatura premium ativa
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single()

    const isPremium = subscription?.subscription_plans?.name === "premium"

    return { isSubscribed: isPremium, user: session.user }
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error)
    return { isSubscribed: false, user: session.user }
  }
}
