import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Ferramentas Premium para Cada Profissional
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Acesse nossa suíte de ferramentas poderosas com assinaturas em níveis projetadas para atender às suas
                necessidades.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-1">
                  Começar Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full h-[450px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)] dark:bg-grid-white/10"></div>
              <div className="relative z-10 px-6 py-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border">
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Prévia do Painel Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Desbloqueie análises avançadas, suporte prioritário e ferramentas exclusivas
                  </p>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="h-24 rounded-md bg-muted animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 rounded-md bg-muted animate-pulse"></div>
                    <div className="h-32 rounded-md bg-muted animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
