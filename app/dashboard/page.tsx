import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"
import { CalculationHistory } from "@/components/dashboard/calculation-history"
import { getAllSavedCalculations, getCalculationsByUserId } from "@/lib/supabase/database"
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

// Componente para carregar os cálculos
async function CalculationsLoader({ userId }: { userId: string }) {
  try {
    // Tente buscar os cálculos salvos
    const { data: savedCalculations, success } = await getAllSavedCalculations(userId)

    // Se falhar, tente buscar os cálculos da tabela original como fallback
    if (!success || !savedCalculations || savedCalculations.length === 0) {
      const oldCalculations = await getCalculationsByUserId(userId)
      return <CalculationHistory calculations={oldCalculations || []} />
    }

    return <CalculationHistory calculations={savedCalculations} />
  } catch (error) {
    console.error("Erro ao carregar cálculos:", error)
    return <ErrorFallback />
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

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsDashboard />
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
        <Suspense fallback={<div>Carregando histórico de cálculos...</div>}>
          <CalculationsLoader userId={session.user.id} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
