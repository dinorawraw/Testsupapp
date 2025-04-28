"use server"

import { createServerActionClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

interface YoutubeCalculationData {
  views: number
  cpm: number
  watchTime: number
  estimatedEarnings: number
}

export async function saveYoutubeCalculation(data: YoutubeCalculationData) {
  try {
    const supabase = createServerActionClient()

    // Obter o usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Salvar o cálculo
    const { error } = await supabase.from("calculations").insert([
      {
        user_id: user.id,
        type: "youtube",
        data: {
          views: data.views,
          cpm: data.cpm,
          watch_time: data.watchTime,
          estimated_earnings: data.estimatedEarnings,
        },
        result: data.estimatedEarnings,
      },
    ])

    if (error) {
      console.error("Erro ao salvar cálculo do YouTube:", error)
      return { success: false, error: error.message }
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard")
    revalidatePath("/calculators/youtube")

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao processar cálculo do YouTube:", error)
    return { success: false, error: error.message }
  }
}
