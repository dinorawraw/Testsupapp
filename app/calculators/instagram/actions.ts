"use server"

import { createUniversalClient } from "@/lib/supabase/universal-client"
import { revalidatePath } from "next/cache"

interface InstagramCalculationData {
  name: string
  platform: string
  followers: number
  engagement: number
  likes: number
  comments: number
  content_type: string
  has_discount: boolean
  estimated_value: number
}

export async function saveInstagramCalculation(data: InstagramCalculationData) {
  try {
    const supabase = createUniversalClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Save the calculation to the database
    const { data: savedData, error } = await supabase
      .from("calculations")
      .insert([
        {
          user_id: user.id,
          platform: data.platform,
          name: data.name,
          followers: data.followers,
          engagement: data.engagement,
          likes: data.likes,
          comments: data.comments,
          content_type: data.content_type,
          has_discount: data.has_discount,
          estimated_value: data.estimated_value,
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao salvar cálculo:", error)
      return { success: false, error: error.message }
    }

    // Also save to the saved_calculations table for history
    const { error: savedError } = await supabase.from("saved_calculations").insert([
      {
        user_id: user.id,
        platform: data.platform,
        name: data.name,
        data: {
          followers: data.followers,
          engagement: data.engagement,
          likes: data.likes,
          comments: data.comments,
          content_type: data.content_type,
          has_discount: data.has_discount,
        },
        result: data.estimated_value,
      },
    ])

    if (savedError) {
      console.error("Erro ao salvar no histórico:", savedError)
      // Continue even if there's an error with the history
    }

    // Revalidate the path to update the UI
    revalidatePath("/calculators/instagram")
    revalidatePath("/dashboard")

    return { success: true, data: savedData }
  } catch (error: any) {
    console.error("Erro ao processar cálculo:", error)
    return { success: false, error: error.message || "Erro desconhecido" }
  }
}
