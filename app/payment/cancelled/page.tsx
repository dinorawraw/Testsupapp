"use client"

import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentCancelledPage() {
  const router = useRouter()

  const handleTryAgain = () => {
    router.push("/payment")
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-lg py-10">
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-center text-2xl text-white">Pagamento Cancelado</CardTitle>
              <CardDescription className="text-center text-white">
                Seu pagamento foi cancelado e nenhuma cobrança foi feita
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center text-white">
          <p>
            Você cancelou o processo de pagamento. Se encontrou algum problema ou tem dúvidas, entre em contato com
            nosso suporte.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button onClick={handleTryAgain} className="w-full text-white">
            Tentar Novamente
          </Button>
          <Button onClick={handleGoToDashboard} variant="outline" className="w-full text-white">
            Voltar ao Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
