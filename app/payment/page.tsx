"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCard, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe não foi carregado corretamente")
      }

      // Criar sessão de checkout
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirecionar para o checkout do Stripe
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg py-10">
      <div className="mb-8 space-y-4 text-center">
        <h1 className="text-3xl font-bold text-white">Complete Sua Compra</h1>
        <p className="text-white">Você está assinando o plano Premium por R$9,99/mês</p>
      </div>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5" />
            Assinatura Premium
          </CardTitle>
          <CardDescription className="text-white">Acesso a todas as ferramentas e recursos premium</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="text-white">Ferramentas avançadas de stream</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="text-white">Ferramentas de criação</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="text-white">Análises de stream</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="text-white">Acesso à API</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="text-white">Suporte prioritário</p>
            </div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-white">Pagamento Seguro</p>
                <p className="text-xs text-white">
                  Suas informações de pagamento são criptografadas e seguras. Nunca armazenamos seus dados completos do
                  cartão.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCheckout} className="w-full text-white" disabled={isLoading}>
            {isLoading ? "Processando..." : "Pagar R$9,99/mês"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
