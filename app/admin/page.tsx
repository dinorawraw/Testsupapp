import { AdminShell } from "@/components/admin/admin-shell"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminHeader />
        <AdminTabs />
      </div>
    </AdminShell>
  )
}
