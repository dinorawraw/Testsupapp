import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Função para verificar se o usuário atual é administrador
export async function isCurrentUserAdmin() {
  try {
    const supabase = createClientComponentClient()

    // Verificar se há uma sessão válida
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) return false

    // Verificar se o email do usuário é o email de administrador específico
    if (sessionData.session.user.email === "contato@dinoraw.com.br") return true

    // Verificar o papel (role) do usuário na tabela de perfis
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionData.session.user.id)
      .single()

    return profileData?.role === "admin"
  } catch (error) {
    console.error("Erro ao verificar se o usuário é administrador:", error)
    return false
  }
}

// Função para verificar se o usuário atual está autenticado
export async function isUserAuthenticated() {
  try {
    const supabase = createClientComponentClient()
    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (error) {
    console.error("Erro ao verificar autenticação do usuário:", error)
    return false
  }
}
