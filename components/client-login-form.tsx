"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export function ClientLoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  return <LoginForm callbackUrl={callbackUrl} />
}
