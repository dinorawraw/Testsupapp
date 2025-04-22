"use server"

import { revalidatePath } from "next/cache"
import { getUserByEmail, saveCalculation } from "@/lib/supabase/database"
import { createServerActionClient } from "@/lib/supabase/client"

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
    // Get current user
    const supabase = createServerActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Get user from database
    const dbUser = await getUserByEmail(user.email || "")

    if (!dbUser) {
      return { success: false, error: "Usuário não encontrado no banco de dados" }
    }

    // Get form data
    const subscribers = Number.parseInt(formData.get("subscribers") as string)
    const views = Number.parseInt(formData.get("views") as string)
    const engagement = Number.parseFloat(formData.get("engagement") as string)
    const contentType = formData.get("contentType") as string

    // Validate input
    if (isNaN(subscribers) || isNaN(views) || isNaN(engagement)) {
      return { success: false, error: "Dados inválidos" }
    }

    // Calculate estimated value
    const estimatedValue = calculateYoutubeValue(subscribers, views, engagement, contentType)

    // Save calculation to database
    const result = await saveCalculation(dbUser.id, {
      platform: "youtube",
      subscribers,
      views,
      engagement,
      content_type: contentType,
      estimated_value: estimatedValue,
    })

    // Revalidate the path to update UI
    revalidatePath("/calculators/youtube")
    revalidatePath("/dashboard")

    return result
  } catch (error) {
    console.error("Erro ao salvar cálculo do YouTube:", error)
    return { success: false, error: "Erro ao processar o cálculo" }
  }
}
