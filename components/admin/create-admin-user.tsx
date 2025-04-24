"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateAdminUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const createAdminUser = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Criar o usuário
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: "contato@dinoraw.com.br",
        password: "@Dinpaladin123",
        email_confirm: true,
        user_metadata: { full_name: "Administrador" },
      })

      if (userError) throw new Error(`Erro ao criar usuário: ${userError.message}`)

      // 2. Definir o papel (role) do usuário como admin
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userData.user.id)

      if (profileError) throw new Error(`Erro ao definir papel de administrador: ${profileError.message}`)

      setSuccess("Usuário administrador criado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao criar usuário administrador:", error)
      setError(error.message || "Erro ao criar usuário administrador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Usuário Administrador</CardTitle>
        <CardDescription>
          Cria um usuário administrador com email contato@dinoraw.com.br e senha @Dinpaladin123
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <p>Este botão criará um usuário administrador com as seguintes credenciais:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Email: contato@dinoraw.com.br</li>
          <li>Senha: @Dinpaladin123</li>
        </ul>
        <p className="mt-2">
          Este usuário terá acesso ao painel de administração e será redirecionado automaticamente para lá após o login.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={createAdminUser} disabled={loading}>
          {loading ? "Criando..." : "Criar Usuário Administrador"}
        </Button>
      </CardFooter>
    </Card>
  )
}
