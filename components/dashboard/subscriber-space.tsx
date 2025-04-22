"use client"

import { useState } from "react"
import { Lightbulb, BarChart2, MessageSquare, Lock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IdeaBoard } from "@/components/subscriber/idea-board"
import { InsightsBlog } from "@/components/subscriber/insights-blog"
import { PersonalConsultation } from "@/components/subscriber/personal-consultation"

export function SubscriberSpace() {
  const { toast } = useToast()
  // This would be fetched from your API in a real application
  const [subscription, setSubscription] = useState({
    tier: "free", // or "premium"
  })
  const [activeDialog, setActiveDialog] = useState<"ideas" | "insights" | "consultation" | null>(null)

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

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Espaço do Assinante</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Board de Ideias</CardTitle>
              {subscription.tier !== "premium" ? (
                <Lock className="h-4 w-4 text-white" />
              ) : (
                <Lightbulb className="h-4 w-4 text-white" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white mb-4">Obtenha ideias de conteúdo para suas redes sociais</div>
              <Button
                className="w-full text-white"
                variant={subscription.tier === "premium" ? "default" : "outline"}
                onClick={() => handlePremiumFeature("ideas")}
              >
                {subscription.tier === "premium" ? "Acessar Ideias" : "Recurso Premium"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Insights</CardTitle>
              {subscription.tier !== "premium" ? (
                <Lock className="h-4 w-4 text-white" />
              ) : (
                <BarChart2 className="h-4 w-4 text-white" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white mb-4">Análises e posts sobre conteúdo e tendências</div>
              <Button
                className="w-full text-white"
                variant={subscription.tier === "premium" ? "default" : "outline"}
                onClick={() => handlePremiumFeature("insights")}
              >
                {subscription.tier === "premium" ? "Ver Insights" : "Recurso Premium"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Consultoria Personalizada</CardTitle>
              {subscription.tier !== "premium" ? (
                <Lock className="h-4 w-4 text-white" />
              ) : (
                <MessageSquare className="h-4 w-4 text-white" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white mb-4">Agende uma sessão de consultoria com nossos especialistas</div>
              <Button
                className="w-full text-white"
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
            <DialogTitle className="text-white">Board de Ideias</DialogTitle>
            <DialogDescription className="text-white">
              Explore ideias de conteúdo para suas redes sociais
            </DialogDescription>
          </DialogHeader>
          <IdeaBoard />
        </DialogContent>
      </Dialog>

      {/* Diálogo para Insights */}
      <Dialog open={activeDialog === "insights"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Insights</DialogTitle>
            <DialogDescription className="text-white">Análises e posts sobre conteúdo e tendências</DialogDescription>
          </DialogHeader>
          <InsightsBlog />
        </DialogContent>
      </Dialog>

      {/* Diálogo para Consultoria Personalizada */}
      <Dialog open={activeDialog === "consultation"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Consultoria Personalizada</DialogTitle>
            <DialogDescription className="text-white">
              Chat exclusivo para consultoria com nossos especialistas
            </DialogDescription>
          </DialogHeader>
          <PersonalConsultation />
        </DialogContent>
      </Dialog>
    </>
  )
}
