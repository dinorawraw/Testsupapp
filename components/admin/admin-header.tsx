"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AdminHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function AdminHeader({ heading, text, children }: AdminHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Fazer logout usando o cliente Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })

      // Redirecionar para a página de login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide md:text-3xl gradient-text">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-4">
        {children}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 gradient-hover"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </Button>
      </div>
    </div>
  )
}
