"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

export function UserSubscriptionInfo() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [subscription, setSubscription] = useState({
    tier: "free",
    status: "active",
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        // Obter o usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Verificar se a tabela de assinaturas existe
        const { error: tableError } = await supabase.from("subscriptions").select("count").limit(1)

        if (tableError) {
          console.log("A tabela de assinaturas pode não existir ainda:", tableError)
          setIsLoading(false)
          return
        }

        // Obter a assinatura ativa do usuário
        const { data } = await supabase
          .from("subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (data) {
          setSubscription({
            tier: data.subscription_plans?.name || "free",
            status: data.status,
            renewalDate: new Date(
              data.current_period_end || Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString(),
          })
        }
      } catch (error) {
        console.error("Erro ao buscar assinatura:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [supabase])

  const handleUpgrade = () => {
    router.push("/payment")
  }

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true)

      // Obter o usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      // Obter a assinatura ativa do usuário
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (!subscription?.stripe_customer_id) {
        throw new Error("Assinatura não encontrada")
      }

      // Criar sessão do portal do cliente
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirecionar para o portal do cliente
      window.location.href = url
    } catch (error: any) {
      console.error("Erro ao gerenciar assinatura:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao gerenciar sua assinatura.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-muted/30 border-dashed gradient-border">
        <CardContent className="p-6">
          <div className="h-20 animate-pulse bg-muted/20 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-muted/30 border-dashed gradient-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-white">Assinatura</CardTitle>
          <Badge variant={subscription.tier === "premium" ? "default" : "outline"} className="text-xs font-semibold">
            {subscription.tier === "premium" ? "Premium" : "Gratuito"}
          </Badge>
        </div>
        <CardDescription className="text-xs text-white">
          {subscription.tier === "premium"
            ? "Você tem acesso a todos os recursos premium"
            : "Atualize para premium para acesso completo a todos os recursos"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4">
          {subscription.tier === "premium" ? (
            <>
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Assinatura Premium</p>
                <p className="text-xs text-white/90">Renova em {subscription.renewalDate}</p>
              </div>
            </>
          ) : (
            <>
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Plano Gratuito</p>
                <p className="text-xs text-white/90">Acesso limitado a ferramentas e recursos</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {subscription.tier === "premium" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageSubscription}
            className="text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 border-gray-700"
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Gerenciar Assinatura"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="text-xs font-medium bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Atualizar para Premium"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
