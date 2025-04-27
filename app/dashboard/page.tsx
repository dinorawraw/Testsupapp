import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"
import { CalculationHistory } from "@/components/dashboard/calculation-history"
import { ExportData } from "@/components/dashboard/export-data"
import { getAllSavedCalculations } from "@/lib/supabase/database"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Buscar cálculos salvos
  const { data: savedCalculations } = await getAllSavedCalculations(session.user.id)

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
      <div className="grid gap-4 md:grid-cols-2">
        <CalculationHistory calculations={savedCalculations || []} />
        <ExportData />
      </div>
    </DashboardShell>
  )
}
