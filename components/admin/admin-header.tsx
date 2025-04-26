"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AdminHeaderProps {
  heading?: string
  text?: string
}

export function AdminHeader({
  heading = "Admin Dashboard",
  text = "Manage users, subscriptions, and platform settings.",
}: AdminHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast({
        title: "Logout successful",
        description: "You have been successfully logged out.",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error logging out",
        description: "An error occurred while trying to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-card p-6 shadow-md">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide md:text-3xl">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
