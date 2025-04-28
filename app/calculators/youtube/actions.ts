"use server"

import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@/lib/supabase/server-actions"

interface YoutubeCalculationData {
  subscribers: number
  views: number
  engagement: number
  result: number
}

export async function saveYoutubeCalculation(data: YoutubeCalculationData) {
  try {
    const supabase = createServerActionClient()

    // Obter o usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    // Salvar o cálculo
    const { error } = await supabase.from("calculations").insert({
      user_id: user.id,
      type: "youtube",
      data: {
        subscribers: data.subscribers,
        views: data.views,
        engagement: data.engagement,
        result: data.result,
      },
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao salvar cálculo:", error)
      throw error
    }

    // Revalidar o caminho do dashboard para mostrar o novo cálculo
    revalidatePath("/dashboard")
    revalidatePath("/calculators/youtube")

    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar cálculo do YouTube:", error)
    return { success: false, error }
  }
}
