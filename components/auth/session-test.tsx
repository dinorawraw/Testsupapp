"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SessionTest() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const checkSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Erro ao verificar sessão:", error)
        setSessionData({ error: error.message })
      } else {
        setSessionData(data)
      }
    } catch (error: any) {
      console.error("Erro ao verificar sessão:", error)
      setSessionData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Sessão</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkSession} disabled={loading}>
          {loading ? "Verificando..." : "Verificar Sessão"}
        </Button>

        {sessionData && (
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
