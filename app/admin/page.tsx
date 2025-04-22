import type { Metadata } from "next"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { CalculationData } from "@/components/admin/calculation-data"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing users and subscriptions",
}

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminHeader heading="Admin Dashboard" text="Manage users, subscriptions, and platform settings." />
      <CalculationData />
      <AdminTabs />
    </AdminShell>
  )
}
