import { getServiceClient } from "@/lib/supabase"

export default async function UserProfile({ userId }: { userId: string }) {
  // Usando o cliente com a chave de serviço para acessar dados no servidor
  const supabase = getServiceClient()

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    return <div>Erro ao carregar perfil: {error.message}</div>
  }

  if (!profile) {
    return <div>Perfil não encontrado</div>
  }

  return (
    <div>
      <h2>Perfil do Usuário</h2>
      <p>Nome: {profile.full_name}</p>
      <p>Email: {profile.email}</p>
      {/* Outros dados do perfil */}
    </div>
  )
}
