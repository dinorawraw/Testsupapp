import { CheckCircle, LineChart, Lock, Users } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Recursos Principais</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tudo o que Você Precisa</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Nossa plataforma fornece ferramentas poderosas para profissionais em todos os níveis
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid gap-6">
            <div className="flex gap-4 items-start">
              <Lock className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Autenticação Segura</h3>
                <p className="text-muted-foreground">
                  Autenticação de múltiplos fatores e armazenamento de dados criptografados para manter sua conta segura
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Users className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Acesso em Níveis</h3>
                <p className="text-muted-foreground">
                  Escolha entre níveis Gratuito e Premium com diferentes conjuntos de recursos para atender às suas
                  necessidades
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex gap-4 items-start">
              <LineChart className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Análises Avançadas</h3>
                <p className="text-muted-foreground">
                  Ferramentas abrangentes de visualização de dados e relatórios para assinantes Premium
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <CheckCircle className="h-10 w-10 text-primary" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Suporte Prioritário</h3>
                <p className="text-muted-foreground">
                  Membros Premium têm acesso a suporte dedicado e tempos de resposta mais rápidos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
