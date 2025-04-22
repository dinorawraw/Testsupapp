"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function DashboardTestePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Erro ao obter usuário:", error)
        window.location.href = "/login-teste"
        return
      }

      if (data?.user) {
        setUser(data.user)
      } else {
        window.location.href = "/login-teste"
      }

      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login-teste"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard de Teste</h1>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Informações do Usuário</h2>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Criado em:</strong> {new Date(user.created_at).toLocaleString()}
          </p>
        </div>

        <button onClick={handleLogout} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
          Sair
        </button>
      </div>
    </div>
  )
}
