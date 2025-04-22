import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function checkSubscription(req: NextRequest) {
  // Criar cliente Supabase sem depender de cookies do servidor
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Extrair o token de autenticação do cabeçalho ou cookie
  const authHeader = req.headers.get("authorization")
  const token = authHeader ? authHeader.replace("Bearer ", "") : null

  if (!token) {
    return { isSubscribed: false, user: null }
  }

  try {
    // Verificar o token
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return { isSubscribed: false, user: null }
    }

    // Verificar se a tabela de assinaturas existe
    const { error: tableError } = await supabase.from("subscriptions").select("count").limit(1)

    if (tableError) {
      console.log("A tabela de assinaturas pode não existir ainda:", tableError)
      return { isSubscribed: false, user: userData.user }
    }

    // Verificar se o usuário tem uma assinatura premium ativa
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .single()

    const isPremium = subscription?.subscription_plans?.name === "premium"

    return { isSubscribed: isPremium, user: userData.user }
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error)
    return { isSubscribed: false, user: null }
  }
}
