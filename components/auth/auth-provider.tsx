"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient, User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  supabase: SupabaseClient
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Criar cliente Supabase
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Verificar sessão atual ao carregar
    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error("Erro ao obter sessão:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Configurar listener para mudanças de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession?.user?.email)
      setSession(newSession)
      setUser(newSession?.user ?? null)

      // Atualizar a UI quando o estado de autenticação mudar
      if (newSession) {
        router.refresh()
      }
    })

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const value = {
    user,
    session,
    supabase,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
