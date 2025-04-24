"use client"

import { LogOut } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"

export function DashboardLogout() {
  return (
    <LogoutButton variant="outline" size="sm" className="flex items-center gap-2 gradient-hover">
      <LogOut className="h-4 w-4" />
      <span>Sair</span>
    </LogoutButton>
  )
}
