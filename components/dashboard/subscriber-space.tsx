"use client"

import { useState, useEffect } from "react"
import { Lightbulb, BarChart2, MessageSquare, Lock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IdeaBoard } from "@/components/subscriber/idea-board"
import { InsightsBlog } from "@/components/subscriber/insights-blog"
import { PersonalConsultation } from "@/components/subscriber/personal-consultation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SubscriberSpace() {
  const { toast } = useToast()
  const [subscription, setSubscription] = useState({
    tier: "loading", // "loading", "free", or "premium"
    isLoading: true,
  })
  const [activeDialog, setActiveDialog] = useState<"ideas" | "insights" | "consultation" | null>(null)
  const supabase = createClientComponentClient()

  // Buscar o status da assinatura do usuário
  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        // Obter o usuário atual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Erro ao obter usuário:", userError)
          setSubscription({ tier: "free", isLoading: false })
          return
        }

        // Buscar assinatura ativa do usuário
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select(`
            *,
            subscription_plans(*)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (subscriptionError) {
          console.error("Erro ao buscar assinatura:", subscriptionError)
          setSubscription({ tier: "free", isLoading: false })
          return
        }

        // Verificar se o usuário tem assinatura premium
        const isPremium = subscriptionData?.subscription_plans?.name === "premium"
        setSubscription({
          tier: isPremium ? "premium" : "free",
          isLoading: false,
        })

        console.log("Status da assinatura:", isPremium ? "premium" : "free")
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error)
        setSubscription({ tier: "free", isLoading: false })
      }
    }

    fetchSubscriptionStatus()
  }, [supabase])

  const handlePremiumFeature = (feature: "ideas" | "insights" | "consultation") => {
    if (subscription.tier !== "premium") {
      toast({
        title: "Recurso Premium",
        description: "Este recurso está disponível apenas para assinantes premium.",
        variant: "destructive",
      })
    } else {
      setActiveDialog(feature)
    }
  }

  if (subscription.isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Espaço do Assinante</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="gradient-border opacity-70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">Carregando recursos...</div>
                <div className="w-full h-8 bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Espaço do Assinante</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Board de Ideias</CardTitle>
              {subscription.tier !== "premium" ? <Lock className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">Obtenha ideias de conteúdo para suas redes sociais</div>
              <Button
                className="w-full"
                variant={subscription.tier === "premium" ? "default" : "outline"}
                onClick={() => handlePremiumFeature("ideas")}
              >
                {subscription.tier === "premium" ? "Acessar Ideias" : "Recurso Premium"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insights</CardTitle>
              {subscription.tier !== "premium" ? <Lock className="h-4 w-4" /> : <BarChart2 className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">Análises e posts sobre conteúdo e tendências</div>
              <Button
                className="w-full"
                variant={subscription.tier === "premium" ? "default" : "outline"}
                onClick={() => handlePremiumFeature("insights")}
              >
                {subscription.tier === "premium" ? "Ver Insights" : "Recurso Premium"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultoria Personalizada</CardTitle>
              {subscription.tier !== "premium" ? <Lock className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">Agende uma sessão de consultoria com nossos especialistas</div>
              <Button
                className="w-full"
                variant={subscription.tier === "premium" ? "default" : "outline"}
                onClick={() => handlePremiumFeature("consultation")}
              >
                {subscription.tier === "premium" ? "Agendar Consultoria" : "Recurso Premium"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo para o Board de Ideias */}
      <Dialog open={activeDialog === "ideas"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Board de Ideias</DialogTitle>
            <DialogDescription>Explore ideias de conteúdo para suas redes sociais</DialogDescription>
          </DialogHeader>
          <IdeaBoard />
        </DialogContent>
      </Dialog>

      {/* Diálogo para Insights */}
      <Dialog open={activeDialog === "insights"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insights</DialogTitle>
            <DialogDescription>Análises e posts sobre conteúdo e tendências</DialogDescription>
          </DialogHeader>
          <InsightsBlog />
        </DialogContent>
      </Dialog>

      {/* Diálogo para Consultoria Personalizada */}
      <Dialog open={activeDialog === "consultation"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultoria Personalizada</DialogTitle>
            <DialogDescription>Chat exclusivo para consultoria com nossos especialistas</DialogDescription>
          </DialogHeader>
          <PersonalConsultation />
        </DialogContent>
      </Dialog>
    </>
  )
}
