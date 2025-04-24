"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function saveTikTokCalculation(formData: FormData) {
  try {
    const supabase = createClientComponentClient()

    // Obter a sessão atual
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = sessionData.session.user.id

    // Extrair dados do FormData
    const followers = formData.get("followers") ? Number(formData.get("followers")) : 0
    const engagement = formData.get("engagement") ? Number(formData.get("engagement")) : 0
    const views = formData.get("views") ? Number(formData.get("views")) : 0
    const valuePerPost = formData.get("valuePerPost") ? Number(formData.get("valuePerPost")) : 0
    const valuePerVideo = formData.get("valuePerVideo") ? Number(formData.get("valuePerVideo")) : 0

    // Inserir na tabela de cálculos
    const { data, error } = await supabase.from("calculations").insert([
      {
        user_id: userId,
        platform: "tiktok",
        data: {
          followers,
          engagement,
          views,
          valuePerPost,
          valuePerVideo,
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
