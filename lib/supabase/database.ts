import { createServerActionClient, createServerComponentClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Tipos
export interface CalculationData {
  platform: string
  followers?: number
  engagement?: number
  views?: number
  subscribers?: number
  content_type?: string
  estimated_value: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: Record<string, boolean>
  stripe_price_id: string | null
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string | null
  plan?: SubscriptionPlan
}

// Funções para usuários
export async function createUser(email: string, name: string) {
  const supabase = createServerActionClient()

  const { data, error } = await supabase.from("users").insert([{ email, name }]).select().single()

  if (error) {
    console.error("Erro ao criar usuário:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getUserByEmail(email: string) {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }

  return data
}

export async function getUserById(id: string) {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao buscar usuário:", error)
    return null
  }

  return data
}

// Funções para cálculos
export async function saveCalculation(userId: string, calculationData: CalculationData) {
  const supabase = createServerActionClient()

  const { data, error } = await supabase
    .from("calculations")
    .insert([
      {
        user_id: userId,
        ...calculationData,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao salvar cálculo:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getCalculationsByUserId(userId: string) {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar cálculos:", error)
    return []
  }

  return data
}

export async function getAllCalculations() {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase
    .from("calculations")
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar todos os cálculos:", error)
    return []
  }

  return data
}

// Funções para planos de assinatura
export async function getAllSubscriptionPlans() {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true })

  if (error) {
    console.error("Erro ao buscar planos de assinatura:", error)
    return []
  }

  return data
}

export async function getSubscriptionPlanById(planId: string) {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", planId).single()

  if (error) {
    console.error("Erro ao buscar plano de assinatura:", error)
    return null
  }

  return data
}

// Funções para assinaturas de usuários
export async function createSubscription(
  userId: string,
  planId: string,
  status: string,
  periodStart: Date,
  periodEnd: Date,
  stripeSubscriptionId?: string,
) {
  const supabase = createServerActionClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: userId,
        plan_id: planId,
        status,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        stripe_subscription_id: stripeSubscriptionId,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar assinatura:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getUserSubscription(userId: string) {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      plan:subscription_plans (*)
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 é o código para "nenhum resultado encontrado"
    console.error("Erro ao buscar assinatura do usuário:", error)
    return null
  }

  return data
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  const supabase = createServerActionClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", subscriptionId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar status da assinatura:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getAllSubscriptions() {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      user:users (
        id,
        name,
        email
      ),
      plan:subscription_plans (
        id,
        name,
        price
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar todas as assinaturas:", error)
    return []
  }

  return data
}

// Função para verificar se o usuário tem acesso a um recurso específico
export async function checkUserAccess(user: User | null, feature: string): Promise<boolean> {
  if (!user) return false

  try {
    const subscription = await getUserSubscription(user.id)

    // Se não tem assinatura, só tem acesso a recursos gratuitos
    if (!subscription) {
      const freePlan = await getFreePlan()
      if (!freePlan || !freePlan.features) return false

      return !!freePlan.features[feature]
    }

    // Verifica se o plano da assinatura permite acesso ao recurso
    if (!subscription.plan || !subscription.plan.features) return false

    return !!subscription.plan.features[feature]
  } catch (error) {
    console.error("Erro ao verificar acesso do usuário:", error)
    return false
  }
}

// Função auxiliar para obter o plano gratuito
async function getFreePlan(): Promise<SubscriptionPlan | null> {
  const supabase = createServerComponentClient()

  const { data, error } = await supabase.from("subscription_plans").select("*").eq("name", "Free").single()

  if (error) {
    console.error("Erro ao buscar plano gratuito:", error)
    return null
  }

  return data
}
