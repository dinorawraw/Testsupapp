"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Criar cliente Supabase
  const supabase = createClientComponentClient()

  // Verificar se já existe uma sessão ativa ao carregar o componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setUser(data.session.user)
          console.log("Sessão ativa encontrada, redirecionando para dashboard...")
          // Verificar se há um parâmetro redirectTo na URL
          const params = new URLSearchParams(window.location.search)
          const redirectTo = params.get("redirectTo") || "/dashboard"
          router.push(redirectTo)
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Configurar listener para mudanças de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession?.user?.email)
      setUser(newSession?.user ?? null)

      // Atualizar a UI quando o estado de autenticação mudar
      if (newSession) {
        router.refresh()
      }
    })

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    // Validação básica
    if (!email || !password) {
      setError("Email e senha são obrigatórios")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Tentando fazer login com:", email)

      // Usar try-catch para capturar qualquer erro durante a autenticação
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Resposta completa do login:", { data, error })

      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos. Verifique suas credenciais.")
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Email não confirmado. Verifique sua caixa de entrada.")
        } else {
          throw new Error(error.message || "Erro de autenticação")
        }
      }

      if (!data?.session) {
        throw new Error("Sessão não criada. Verifique suas credenciais.")
      }

      console.log("Login bem-sucedido, redirecionando...")

      // Verificar se há um parâmetro redirectTo na URL
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get("redirectTo") || "/dashboard"

      // Usar router.push para navegação
      router.push(redirectTo)
    } catch (error: any) {
      console.error("Erro durante o processo de login:", error)
      setError(error.message || "Erro ao fazer login. Tente novamente.")
      // Manter na aba de login quando houver erro
      setActiveTab("login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    // Validação básica
    if (!email || !password || !fullName) {
      setError("Todos os campos são obrigatórios")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Tentando criar conta com:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      console.log("Resposta completa do cadastro:", { data, error })

      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes("already registered")) {
          throw new Error("Este email já está registrado. Tente fazer login.")
        } else {
          throw new Error(error.message || "Erro ao criar conta")
        }
      }

      if (data.session) {
        console.log("Cadastro com autenticação imediata, redirecionando...")
        // Usar router.push para navegação
        router.push("/dashboard")
      } else {
        alert("Verifique seu email para confirmar o cadastro!")
      }
    } catch (error: any) {
      console.error("Erro durante o processo de cadastro:", error)
      setError(error.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Digite seu email para redefinir a senha")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw new Error(error.message)

      alert("Verifique seu email para redefinir sua senha!")
    } catch (error: any) {
      setError(error.message || "Erro ao solicitar redefinição de senha")
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setEmail("")
    setPassword("")
    setFullName("")
    setError(null)
    setActiveTab(value)
  }

  // Mostrar estado de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">Verificando autenticação...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Entre com seu email e senha para acessar sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleSignUp}>
            <CardHeader>
              <CardTitle>Criar conta</CardTitle>
              <CardDescription>Preencha os dados abaixo para criar sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailRegister">Email</Label>
                <Input
                  id="emailRegister"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordRegister">Senha</Label>
                <Input
                  id="passwordRegister"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
