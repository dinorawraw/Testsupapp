"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function saveYoutubeCalculation(formData: FormData) {
  try {
    const supabase = createClientComponentClient()

    // Obter a sessão atual
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = sessionData.session.user.id

    // Extrair dados do FormData
    const subscribers = formData.get("subscribers") ? Number(formData.get("subscribers")) : 0
    const views = formData.get("views") ? Number(formData.get("views")) : 0
    const engagement = formData.get("engagement") ? Number(formData.get("engagement")) : 0
    const valuePerVideo = formData.get("valuePerVideo") ? Number(formData.get("valuePerVideo")) : 0
    const valuePerShort = formData.get("valuePerShort") ? Number(formData.get("valuePerShort")) : 0

    // Inserir na tabela de cálculos
    const { data, error } = await supabase.from("calculations").insert([
      {
        user_id: userId,
        platform: "youtube",
        data: {
          subscribers,
          views,
          engagement,
          valuePerVideo,
          valuePerShort,
        },
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Erro ao salvar cálculo:", error)
      return { success: false, error: error.message }
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Erro ao processar solicitação:", error)
    return { success: false, error: error.message || "Erro desconhecido" }
  }
}
