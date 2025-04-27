import type { Metadata } from "next"
import { InstagramCalculator } from "@/components/calculators/instagram-calculator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createUniversalClient } from "@/lib/supabase/universal-client"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Calculadora de Instagram",
  description: "Calcule o valor de campanhas para Instagram",
}

async function getRecentCalculations() {
  const supabase = createUniversalClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get recent calculations
  const { data } = await supabase
    .from("calculations")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", "instagram")
    .order("created_at", { ascending: false })
    .limit(5)

  return data || []
}

export default async function InstagramCalculatorPage() {
  const recentCalculations = await getRecentCalculations()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calculadora de Instagram</h1>
        <p className="text-muted-foreground">Calcule o valor justo para campanhas de influenciadores no Instagram</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <InstagramCalculator />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cálculos Recentes</CardTitle>
              <CardDescription>Seus últimos cálculos para Instagram</CardDescription>
            </CardHeader>
            <CardContent>
              {recentCalculations.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhum cálculo recente encontrado</p>
              ) : (
                <div className="space-y-4">
                  {recentCalculations.map((calc) => (
                    <div key={calc.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{calc.name}</h3>
                        <span className="text-sm text-muted-foreground">{formatDate(calc.created_at)}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seguidores:</span> {calc.followers?.toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>{" "}
                          {calc.content_type === "post"
                            ? "Post"
                            : calc.content_type === "story"
                              ? "Story"
                              : calc.content_type === "reels"
                                ? "Reels"
                                : "Carrossel"}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Valor:</span>{" "}
                        <span className="font-bold text-primary">
                          R$ {Number(calc.estimated_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
