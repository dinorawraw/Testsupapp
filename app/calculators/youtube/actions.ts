"use server"

import { revalidatePath } from "next/cache"
import {
  createUniversalClient,
  universalSaveCalculation,
  universalSaveCalculationToNewTable,
} from "@/lib/supabase/universal-client"

// Função para calcular o valor estimado do canal do YouTube
function calculateYoutubeValue(subscribers: number, views: number, engagement: number, contentType: string): number {
  // Base value calculation
  const baseValue = subscribers * 0.05 + views * 0.01

  // Engagement multiplier (higher engagement = higher value)
  const engagementMultiplier = 1 + engagement / 100

  // Content type multiplier
  let contentMultiplier = 1.0
  switch (contentType) {
    case "education":
      contentMultiplier = 1.3 // Educational content often has higher value
      break
    case "entertainment":
      contentMultiplier = 1.2 // Entertainment is valuable but varies
      break
    case "gaming":
      contentMultiplier = 1.1 // Gaming has specific audience
      break
    case "lifestyle":
      contentMultiplier = 1.15 // Lifestyle often has good brand fit
      break
    default:
      contentMultiplier = 1.0
  }

  // Calculate final value
  const estimatedValue = baseValue * engagementMultiplier * contentMultiplier

  // Round to 2 decimal places
  return Math.round(estimatedValue * 100) / 100
}

export async function saveYoutubeCalculation(formData: FormData) {
  try {
    // Obter dados do formulário
    const name = (formData.get("name") as string) || `YouTube Calculation - ${new Date().toLocaleDateString()}`
    const subscribers = Number.parseInt(formData.get("subscribers") as string)
    const views = Number.parseInt(formData.get("views") as string)
    const engagement = Number.parseFloat(formData.get("engagement") as string)
    const contentType = formData.get("contentType") as string

    // Validar entrada
    if (isNaN(subscribers) || isNaN(views) || isNaN(engagement)) {
      return { success: false, error: "Dados inválidos" }
    }

    // Calcular valor estimado
    const estimatedValue = calculateYoutubeValue(subscribers, views, engagement, contentType)

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
      platform: "youtube",
      name,
      subscribers,
      views,
      engagement,
      content_type: contentType,
      estimated_value: estimatedValue,
    })

    // Salvar cálculo na nova tabela com estrutura flexível
    await universalSaveCalculationToNewTable(
      user.id,
      "youtube",
      name,
      {
        subscribers,
        views,
        engagement,
        contentType,
      },
      estimatedValue,
    )

    // Revalidar o caminho para atualizar a UI
    revalidatePath("/calculators/youtube")
    revalidatePath("/dashboard")

    return { success: true, data: { estimated_value: estimatedValue } }
  } catch (error) {
    console.error("Erro ao salvar cálculo do YouTube:", error)
    return { success: false, error: "Erro ao processar o cálculo" }
  }
}

export async function getYoutubeCalculationHistory(userId: string) {
  try {
    const supabase = createUniversalClient()

    const { data, error } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "youtube")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórico de cálculos do YouTube:", error)
      return { success: false, error: "Erro ao buscar histórico de cálculos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de cálculos do YouTube:", error)
    return { success: false, error: "Erro ao buscar histórico de cálculos" }
  }
}

export async function getYoutubeSavedCalculations(userId: string) {
  try {
    const supabase = createUniversalClient()

    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "youtube")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar cálculos salvos do YouTube:", error)
      return { success: false, error: "Erro ao buscar cálculos salvos" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar cálculos salvos do YouTube:", error)
    return { success: false, error: "Erro ao buscar cálculos salvos" }
  }
}
