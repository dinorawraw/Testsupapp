"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (data.success) {
          setIsSuccess(true)
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  if (isVerifying) {
    return (
      <div className="container max-w-lg py-10">
        <Card className="card-gradient">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-lg font-medium text-white">Verificando seu pagamento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isSuccess && !isVerifying) {
    return (
      <div className="container max-w-lg py-10">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-center text-white">Erro na Verificação</CardTitle>
            <CardDescription className="text-center text-white">
              Não foi possível verificar seu pagamento. Se você acredita que isso é um erro, entre em contato com o
              suporte.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleContinue} className="w-full text-white">
              Voltar para o Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-lg py-10">
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-center text-2xl text-white">Pagamento Bem-Sucedido!</CardTitle>
              <CardDescription className="text-center text-white">
                Sua assinatura Premium está agora ativa
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center text-white">
          <p>
            Obrigado por assinar o plano Premium. Você agora tem acesso a todos os recursos e ferramentas exclusivas.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinue} className="w-full text-white">
            Ir para o Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
