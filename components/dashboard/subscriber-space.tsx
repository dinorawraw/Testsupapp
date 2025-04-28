"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalConsultation } from "@/components/subscriber/personal-consultation"
import { InsightsBlog } from "@/components/subscriber/insights-blog"
import { IdeaBoard } from "@/components/subscriber/idea-board"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function SubscriberSpace() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkSubscription() {
      try {
        setIsLoading(true)

        // Obter o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsPremium(false)
          return
        }

        // Verificar se o usuário tem uma assinatura ativa
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao verificar assinatura:", error)
        }

        setIsPremium(subscription?.status === "active")
      } catch (error) {
        console.error("Erro ao verificar status premium:", error)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [supabase])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Espaço do Assinante</CardTitle>
          <CardDescription>Carregando recursos premium...</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <div className="animate-pulse">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  if (isPremium === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Espaço do Assinante</CardTitle>
          <CardDescription>Recursos exclusivos para assinantes premium</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Faça upgrade para acessar recursos exclusivos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Consultorias personalizadas</li>
              <li>Blog de insights exclusivos</li>
              <li>Quadro de ideias e sugestões</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/payment")}>Fazer Upgrade</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Espaço do Assinante</CardTitle>
        <CardDescription>Recursos exclusivos para assinantes premium</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="consultations">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultations">Consultorias</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="ideas">Ideias</TabsTrigger>
          </TabsList>
          <TabsContent value="consultations" className="mt-4">
            <PersonalConsultation />
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <InsightsBlog />
          </TabsContent>
          <TabsContent value="ideas" className="mt-4">
            <IdeaBoard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
