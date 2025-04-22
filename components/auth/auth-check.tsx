"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LogoutButton } from "./logout-button"

export function AuthCheck() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error("Erro ao verificar autenticação:", error)
          setUser(null)
        } else {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Falha ao verificar autenticação:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div>Verificando autenticação...</div>
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Não autenticado</AlertTitle>
        <AlertDescription>Você não está autenticado. Por favor, faça login para acessar esta página.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <AlertTitle>Autenticado como {user.email}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <div>ID: {user.id}</div>
        <div>Email: {user.email}</div>
        <div>Criado em: {new Date(user.created_at).toLocaleString()}</div>
        <LogoutButton />
      </AlertDescription>
    </Alert>
  )
}
