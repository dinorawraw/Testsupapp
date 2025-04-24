import { createClient } from "@supabase/supabase-js"
import { createUniversalClient } from "./universal-client"

// Cliente Supabase para uso no lado do cliente
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Tipos
export interface CalculationData {
  platform: string
  followers?: number
  engagement?: number
  views?: number
  subscribers?: number
  content_type?: string
  estimated_value: number
  likes?: number
  comments?: number
  has_discount?: boolean
  name?: string
}

export interface SavedCalculation {
  id: string
  user_id: string
  created_at: string
  platform: string
  name: string
  data: Record<string, any>
  result: number
}

// Funções para cálculos (tabela original)
export async function saveCalculation(userId: string, calculationData: CalculationData) {
  const supabase = createUniversalClient()

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
  const supabase = createUniversalClient()

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

// Funções para cálculos salvos (nova tabela)
export async function saveCalculationToNewTable(
  userId: string,
  platform: string,
  name: string,
  data: Record<string, any>,
  result: number,
) {
  const supabase = createUniversalClient()

  const { data: savedData, error } = await supabase
    .from("saved_calculations")
    .insert([
      {
        user_id: userId,
        platform,
        name,
        data,
        result,
      },
    ])
    .select()

  if (error) {
    console.error("Erro ao salvar cálculo na nova tabela:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data: savedData }
}

export async function getSavedCalculationsByPlatform(userId: string, platform: string) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("saved_calculations")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", platform)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar cálculos salvos:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getAllSavedCalculations(userId: string) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("saved_calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar todos os cálculos salvos:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Funções para assinaturas e planos
export async function getAllSubscriptionPlans() {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true })

  if (error) {
    console.error("Erro ao buscar planos de assinatura:", error)
    return []
  }

  return data
}

export async function getUserSubscription(userId: string) {
  const supabase = createUniversalClient()

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
