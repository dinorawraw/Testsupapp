"use server"

import { createServerActionSupabaseClient } from "@/lib/supabase/server-actions"
import { revalidatePath } from "next/cache"

export async function saveYoutubeCalculation(formData: FormData) {
  try {
    const supabase = createServerActionSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const subscribers = formData.get("subscribers") ? Number.parseInt(formData.get("subscribers") as string) : 0
    const views = formData.get("views") ? Number.parseInt(formData.get("views") as string) : 0
    const engagement = formData.get("engagement") ? Number.parseFloat(formData.get("engagement") as string) : 0
    const videoValue = formData.get("videoValue") ? Number.parseFloat(formData.get("videoValue") as string) : 0
    const shortValue = formData.get("shortValue") ? Number.parseFloat(formData.get("shortValue") as string) : 0

    const { data, error } = await supabase.from("calculations").insert([
      {
        user_id: user.id,
        platform: "youtube",
        data: {
          subscribers,
          views,
          engagement,
          videoValue,
          shortValue,
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
