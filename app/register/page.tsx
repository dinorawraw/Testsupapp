import { Suspense } from "react"
import Link from "next/link"

import { ClientRegisterForm } from "@/components/client-register-form"

// Componente de fallback para o Suspense
function RegisterFormSkeleton() {
  return <div className="h-[450px] w-full animate-pulse rounded-lg bg-muted/20"></div>
}

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Criar uma conta</h1>
          <p className="text-sm text-muted-foreground">Digite suas informações para criar uma conta</p>
        </div>
        <Suspense fallback={<RegisterFormSkeleton />}>
          <ClientRegisterForm />
        </Suspense>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Já tem uma conta? Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
