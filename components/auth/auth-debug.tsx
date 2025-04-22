"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSession() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Erro ao obter sessão:", error)
      }
      setSession(data.session)
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Estado da Autenticação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Status:</strong> {session ? "Autenticado" : "Não autenticado"}
          </div>
          {session && (
            <>
              <div>
                <strong>Usuário:</strong> {session.user.email}
              </div>
              <div>
                <strong>ID:</strong> {session.user.id}
              </div>
              <Button onClick={handleLogout} variant="destructive">
                Sair
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
