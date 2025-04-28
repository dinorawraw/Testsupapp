import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Exportando createServerActionClient como uma exportação nomeada
export { createServerActionClient }

export function createServerClient() {
  return createServerComponentClient({ cookies })
}

export async function getUserSession() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile() {
  const session = await getUserSession()
  if (!session) return null

  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return profile
}

export async function isUserAdmin() {
  const session = await getUserSession()
  if (!session) return false

  // Verificar se o e-mail é o do administrador
  if (session.user.email === "contato@dinoraw.com.br") {
    return true
  }

  // Verificar se o usuário tem o papel de administrador
  const profile = await getUserProfile()
  return profile?.role === "admin"
}
