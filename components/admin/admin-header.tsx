"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

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

  const handleLogout = () => {
    // Em uma aplicação real, você chamaria uma API para fazer logout
    // e invalidar a sessão do usuário

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    })

    // Redirecionar para a página de login
    setTimeout(() => {
      router.push("/login")
    }, 1000)
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide md:text-3xl gradient-text">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-4">
        {children}
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 gradient-hover">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  )
}
