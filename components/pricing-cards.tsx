import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto">
      <Card className="flex flex-col">
        <CardHeader className="flex flex-col space-y-1.5 pb-8">
          <CardTitle className="text-2xl text-white">Gratuito</CardTitle>
          <CardDescription className="text-white">Ferramentas essenciais para iniciantes</CardDescription>
          <div className="mt-4 flex items-baseline text-5xl font-bold text-white">
            R$0
            <span className="ml-1 text-lg font-normal text-white">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="grid flex-1 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Recursos</h4>
            {/* Free tier features */}
            <ul className="grid gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Calculadora básica</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Ferramentas básicas de stream</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Suporte padrão</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/register" className="w-full">
            <Button size="lg" variant="outline" className="w-full text-white">
              Começar Agora
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <Card className="flex flex-col border-primary">
        <CardHeader className="flex flex-col space-y-1.5 pb-8">
          <div className="px-4 py-1 text-xs font-bold bg-primary text-primary-foreground w-fit rounded-full mb-2">
            RECOMENDADO
          </div>
          <CardTitle className="text-2xl text-white">Premium</CardTitle>
          <CardDescription className="text-white">Ferramentas avançadas para profissionais</CardDescription>
          <div className="mt-4 flex items-baseline text-5xl font-bold text-white">
            R$9,99
            <span className="ml-1 text-lg font-normal text-white">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="grid flex-1 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Recursos</h4>
            {/* Premium tier features */}
            <ul className="grid gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Tudo do plano Gratuito</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Ferramentas avançadas de stream</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Ferramentas de criação</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Análises de stream</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-white">Acesso à API</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/register?plan=premium" className="w-full">
            <Button size="lg" className="w-full text-white">
              Assinar Agora
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
