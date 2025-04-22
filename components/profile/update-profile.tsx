"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdateProfile({ userId, initialProfile }: { userId: string; initialProfile: any }) {
  const [fullName, setFullName] = useState(initialProfile?.full_name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId)

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateProfile}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nome completo</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">Perfil atualizado com sucesso!</div>}

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  )
}
