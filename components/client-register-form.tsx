"use client"

import { useSearchParams } from "next/navigation"
import { RegisterForm } from "@/components/register-form"

export function ClientRegisterForm() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "free"

  return <RegisterForm plan={plan} />
}
