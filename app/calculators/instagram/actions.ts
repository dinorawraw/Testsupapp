"use server"

import { revalidatePath } from "next/cache"
import {
  createUniversalClient,
  universalSaveCalculation,
  universalSaveCalculationToNewTable,
} from "@/lib/supabase/universal-client"

export async function saveInstagramCalculation(formData: FormData) {
  try {
    // Obter dados do formulário
    const name = (formData.get("name") as string) || "Instagram Calculation"
    const followers = Number.parseInt(formData.get("followers") as string)
    const scope = formData.get("scope") as string
    const minReach = Number.parseInt(formData.get("minReach") as string)
    const maxReach = Number.parseInt(formData.get("maxReach") as string)
    const engagement = Number.parseInt(formData.get("engagement") as string)
    const licenseDays = Number.parseInt(formData.get("licenseDays") as string)
    const hasDiscount = formData.get("hasDiscount") === "yes"

    // Calcular valores base
    const ratePerFollower = scope === "small" ? 0.014 : 0.008
    const baseValue = followers * ratePerFollower

    // Calcular min reach value
    const minReachValue = (followers * (minReach / 100) * 8) / 1000

    // Calcular max reach value
    const maxReachValue = (followers * (maxReach / 100) * 10) / 1000

    // Calcular license value
    const baseRate = 13.32
    const followersInUnits = followers / 50000
    const licenseValue = baseRate * followersInUnits * licenseDays

    // Calcular valor total
    const totalValue = baseValue + minReachValue + maxReachValue + licenseValue

    // Aplicar desconto se necessário
    const estimatedValue = hasDiscount ? totalValue * 0.9 : totalValue
    const reelsValue = hasDiscount ? totalValue * 2 * 0.9 : totalValue * 2

    // Obter usuário atual
    const supabase = createUniversalClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Salvar cálculo na tabela original
    await universalSaveCalculation(user.id, {
      platform: "instagram",
      name,
      followers,
      engagement,
      has_discount: hasDiscount,
      estimated_value: estimatedValue,
    })

    // Salvar cálculo na nova tabela com estrutura flexível
    await universalSaveCalculationToNewTable(
      user.id,
      "instagram",
      name,
      {
        followers,
        scope,
        minReach,
        maxReach,
        engagement,
        licenseDays,
        hasDiscount,
        reelsValue,
      },
      estimatedValue,
    )

    // Revalidar o caminho para atualizar a UI
    revalidatePath("/calculators/instagram")
    revalidatePath("/dashboard")

    return { success: true, data: { estimated_value: estimatedValue, reelsValue } }
  } catch (error) {
    console.error("Erro ao salvar cálculo do Instagram:", error)
    return { success: false, error: "Erro ao processar o cálculo" }
  }
}

export async function getInstagramCalculationHistory(userId: string) {
  try {
    const supabase = createUniversalClient()

    const { data, error } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórico de cálculos do Instagram:", error)
      return { success: false, error: "Erro ao buscar histórico de cálculos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de cálculos do Instagram:", error)
    return { success: false, error: "Erro ao buscar histórico de cálculos" }
  }
}

export async function getInstagramSavedCalculations(userId: string) {
  try {
    const supabase = createUniversalClient()

    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar cálculos salvos do Instagram:", error)
      return { success: false, error: "Erro ao buscar cálculos salvos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar cálculos salvos do Instagram:", error)
    return { success: false, error: "Erro ao buscar cálculos salvos" }
  }
}
