"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server-client"
import { saveCalculation, saveCalculationToNewTable } from "@/lib/supabase/database"

export async function saveTikTokCalculation(formData: FormData) {
  try {
    // Obter dados do formulário
    const name = (formData.get("name") as string) || "TikTok Calculation"
    const followers = Number.parseInt(formData.get("followers") as string)
    const views = Number.parseInt(formData.get("views") as string)
    const likes = Number.parseInt(formData.get("likes") as string)
    const comments = Number.parseInt(formData.get("comments") as string)
    const hasDiscount = formData.get("hasDiscount") === "yes"

    // Calcular valores base
    const baseValue = followers * 0.004
    const viewsValue = views * 0.004
    const likesValue = likes * 0.008
    const commentsValue = comments * 0.08

    // Calcular taxa de engajamento
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0

    // Calcular valor total com ajustes
    const calculatedValue = baseValue + viewsValue + likesValue + commentsValue
    const threshold = 10000
    const highValueFactor = 0.4
    const lowValueFactor = 0.24

    const engagementPenalty = engagementRate < 5 ? 0.7 : 1

    let adjustedValue =
      calculatedValue > threshold ? calculatedValue * highValueFactor : calculatedValue * lowValueFactor

    adjustedValue = adjustedValue * engagementPenalty

    // Aplicar desconto se necessário
    const estimatedValue = hasDiscount ? adjustedValue * 0.9 : adjustedValue

    // Obter usuário atual
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Salvar cálculo na tabela original
    await saveCalculation(user.id, {
      platform: "tiktok",
      name,
      followers,
      views,
      likes,
      comments,
      has_discount: hasDiscount,
      engagement: engagementRate,
      estimated_value: estimatedValue,
    })

    // Salvar cálculo na nova tabela com estrutura flexível
    await saveCalculationToNewTable(
      user.id,
      "tiktok",
      name,
      {
        followers,
        views,
        likes,
        comments,
        hasDiscount,
        engagement: engagementRate,
      },
      estimatedValue,
    )

    // Revalidar o caminho para atualizar a UI
    revalidatePath("/calculators/tiktok")
    revalidatePath("/dashboard")

    return { success: true, data: { estimated_value: estimatedValue } }
  } catch (error) {
    console.error("Erro ao salvar cálculo do TikTok:", error)
    return { success: false, error: "Erro ao processar o cálculo" }
  }
}

export async function getTikTokCalculationHistory(userId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "tiktok")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórico de cálculos do TikTok:", error)
      return { success: false, error: "Erro ao buscar histórico de cálculos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de cálculos do TikTok:", error)
    return { success: false, error: "Erro ao buscar histórico de cálculos" }
  }
}

export async function getTikTokSavedCalculations(userId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "tiktok")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar cálculos salvos do TikTok:", error)
      return { success: false, error: "Erro ao buscar cálculos salvos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar cálculos salvos do TikTok:", error)
    return { success: false, error: "Erro ao buscar cálculos salvos" }
  }
}
