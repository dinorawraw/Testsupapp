import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"
import { CalculationHistory } from "@/components/dashboard/calculation-history"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Buscar cálculos salvos com tratamento de erro
  let calculations = []
  try {
    const { data } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    calculations = data || []
  } catch (error) {
    console.error("Erro ao buscar cálculos:", error)
    // Não fazemos nada aqui, pois o componente CalculationHistory já lida com arrays vazios
  }

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
        <CalculationHistory calculations={calculations} />
      </div>
    </DashboardShell>
  )
}
