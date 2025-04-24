"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function saveTikTokCalculation(data: {
  name: string
  followers: number
  views: number
  likes: number
  comments: number
  hasDiscount: boolean
  estimatedValue: number
}) {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Save calculation to database
    const { data: savedData, error } = await supabase
      .from("calculations")
      .insert([
        {
          user_id: user.id,
          platform: "tiktok",
          name: data.name,
          followers: data.followers,
          views: data.views,
          likes: data.likes,
          comments: data.comments,
          has_discount: data.hasDiscount,
          estimated_value: data.estimatedValue,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao salvar cálculo:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the path to update UI
    revalidatePath("/calculators/tiktok")
    revalidatePath("/dashboard")

    return { success: true, data: savedData }
  } catch (error) {
    console.error("Erro ao salvar cálculo do TikTok:", error)
    return { success: false, error: "Erro ao processar o cálculo" }
  }
}

export async function getTikTokCalculationHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "tiktok")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de cálculos:", error)
    return { success: false, error: "Erro ao buscar histórico" }
  }
}
