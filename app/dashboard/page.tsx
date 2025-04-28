import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"
import { CalculationHistory } from "@/components/dashboard/calculation-history"
import { createUniversalClient } from "@/lib/supabase/universal-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Componente de fallback para erros
function ErrorFallback() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Não foi possível carregar os cálculos salvos. Por favor, tente novamente mais tarde.
      </AlertDescription>
    </Alert>
  )
}

async function getCalculations(userId: string) {
  try {
    const supabase = createUniversalClient()

    // Get all calculations
    const { data } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return data || []
  } catch (error) {
    console.error("Erro ao buscar cálculos:", error)
    return []
  }
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const calculations = await getCalculations(session.user.id)

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsDashboard className="col-span-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DashboardTabs />
        </div>
        <div className="col-span-3">
          <div className="grid gap-4">
            <UserSubscriptionInfo />
            <SubscriberSpace />
          </div>
        </div>
      </div>
      <div className="mt-6">
        {calculations.length > 0 ? (
          <CalculationHistory calculations={calculations} />
        ) : (
          <div className="text-center p-6 bg-muted rounded-lg">
            <p>Nenhum cálculo encontrado. Experimente usar nossas calculadoras!</p>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
