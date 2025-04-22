"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Video, Wand2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AdvancedTools() {
  const { toast } = useToast()
  // This would be fetched from your API in a real application
  const [subscription, setSubscription] = useState({
    tier: "free", // or "premium"
  })

  const handlePremiumFeature = () => {
    if (subscription.tier !== "premium") {
      toast({
        title: "Recurso Premium",
        description: "Este recurso está disponível apenas para assinantes premium.",
        variant: "destructive",
      })
    } else {
      // Handle premium feature access
      toast({
        title: "Sucesso",
        description: "Acessando recurso premium.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Ferramentas Avançadas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className={`gradient-border ${subscription.tier !== "premium" ? "opacity-75" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ferramentas de Stream</CardTitle>
            {subscription.tier !== "premium" ? (
              <Lock className="h-4 w-4 text-white" />
            ) : (
              <Video className="h-4 w-4 text-white" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white mb-4">Ferramentas profissionais para streaming</div>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/stream-tools/gc-stream">
                <Button
                  className="w-full text-white"
                  variant={subscription.tier === "premium" ? "default" : "outline"}
                  onClick={subscription.tier !== "premium" ? handlePremiumFeature : undefined}
                >
                  GC Stream
                </Button>
              </Link>
              <Link href="/stream-tools/rpg-portrait">
                <Button
                  className="w-full text-white"
                  variant={subscription.tier === "premium" ? "default" : "outline"}
                  onClick={subscription.tier !== "premium" ? handlePremiumFeature : undefined}
                >
                  RPG Portrait
                </Button>
              </Link>
              <Link href="/stream-tools/co-board">
                <Button
                  className="w-full text-white"
                  variant={subscription.tier === "premium" ? "default" : "outline"}
                  onClick={subscription.tier !== "premium" ? handlePremiumFeature : undefined}
                >
                  CoBoard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-border opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ferramentas de Criação</CardTitle>
            <Wand2 className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white mb-4">Ferramentas gratuitas de criação e edição de conteúdo</div>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/creation-tools/blur-game">
                <Button variant="outline" className="w-full text-white">
                  Blur Game
                </Button>
              </Link>
              <Link href="/creation-tools">
                <Button variant="outline" className="w-full text-white">
                  Ver Todas as Ferramentas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
