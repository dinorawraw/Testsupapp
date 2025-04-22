import type { Metadata } from "next"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { UserSubscriptionInfo } from "@/components/dashboard/user-subscription-info"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard for managing account and accessing tools",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome to your dashboard. Access all your tools and resources here."
      />
      <UserSubscriptionInfo />
      <DashboardTabs />
    </DashboardShell>
  )
}
