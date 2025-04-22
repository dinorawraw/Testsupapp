import { createServerActionClient } from "./supabase/client"

export async function getCurrentUser() {
  const supabase = createServerActionClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Erro ao obter sessão:", error)
      return null
    }

    if (!session) {
      return null
    }

    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Erro ao obter perfil do usuário:", userError)
      return {
        ...session.user,
        profile: null,
      }
    }

    return {
      ...session.user,
      profile: user,
    }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return null
  }
}

export async function getUserSubscription(userId: string) {
  const supabase = createServerActionClient()

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans(*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) {
      console.error("Erro ao obter assinatura:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error)
    return null
  }
}

export async function isUserPremium(userId: string) {
  const subscription = await getUserSubscription(userId)
  return subscription?.subscription_plans?.name === "premium"
}
