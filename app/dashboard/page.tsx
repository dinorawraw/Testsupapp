import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"

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
    </DashboardShell>
  )
}
