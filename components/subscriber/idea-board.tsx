"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb } from "lucide-react"

interface Idea {
  id: number
  title: string
  description: string
  tags: string[]
  color: string
  created_at: string
  created_by: string
}

export function IdeaBoard() {
  const { toast } = useToast()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchIdeas() {
      try {
        setLoading(true)
        setError(null)

        // Verificar se o usuário é premium
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error("Usuário não autenticado")
        }

        // Verificar assinatura
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select(`
            *,
            subscription_plans(*)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
          console.error("Erro ao verificar assinatura:", subscriptionError)
        }

        const userIsPremium = subscriptionData?.subscription_plans?.name === "premium"
        setIsPremium(userIsPremium)

        // Se não for premium, não buscar ideias
        if (!userIsPremium) {
          setLoading(false)
          return
        }

        // Buscar ideias
        const { data: ideasData, error: ideasError } = await supabase
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false })

        if (ideasError) {
          throw ideasError
        }

        setIdeas(ideasData || [])
      } catch (err) {
        console.error("Erro ao buscar ideias:", err)
        setError("Não foi possível carregar as ideias.")
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [supabase])

  // Filtrar ideias com base na pesquisa
  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (!isPremium) {
    return (
      <div className="p-6 text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Recurso Premium</h3>
        <p className="text-gray-500 mb-4">
          O Board de Ideias está disponível apenas para assinantes premium. Faça upgrade para acessar ideias exclusivas
          para suas redes sociais.
        </p>
        <Button onClick={() => (window.location.href = "/payment")}>Fazer Upgrade</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Pesquisar ideias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-gray-500">Nenhuma ideia encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} style={{ backgroundColor: idea.color + "20" }} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: idea.color }}></div>
              <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription>{new Date(idea.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
