"use server"

import { createServerActionSupabaseClient } from "@/lib/supabase/server-actions"
import { revalidatePath } from "next/cache"

export async function saveInstagramCalculation(formData: FormData) {
  try {
    const supabase = createServerActionSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const followers = formData.get("followers") ? Number.parseInt(formData.get("followers") as string) : 0
    const engagement = formData.get("engagement") ? Number.parseFloat(formData.get("engagement") as string) : 0
    const storyViews = formData.get("storyViews") ? Number.parseInt(formData.get("storyViews") as string) : 0
    const postValue = formData.get("postValue") ? Number.parseFloat(formData.get("postValue") as string) : 0
    const storyValue = formData.get("storyValue") ? Number.parseFloat(formData.get("storyValue") as string) : 0
    const reelsValue = formData.get("reelsValue") ? Number.parseFloat(formData.get("reelsValue") as string) : 0

    const { data, error } = await supabase.from("calculations").insert([
      {
        user_id: user.id,
        platform: "instagram",
        data: {
          followers,
          engagement,
          storyViews,
          postValue,
          storyValue,
          reelsValue,
        },
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Erro ao salvar cálculo:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar cálculo:", error)
    return { success: false, error: "Erro ao processar solicitação" }
  }
}
