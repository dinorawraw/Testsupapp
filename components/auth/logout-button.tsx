"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LogoutButton({ variant = "destructive", size = "default", className = "" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Erro ao fazer logout:", error)
        toast({
          title: "Erro ao fazer logout",
          description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
          variant: "destructive",
        })
        throw error
      }

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })

      console.log("Logout bem-sucedido")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Falha ao fazer logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={loading} variant={variant} size={size} className={className}>
      {loading ? "Saindo..." : "Sair"}
    </Button>
  )
}
