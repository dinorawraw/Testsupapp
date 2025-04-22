import Link from "next/link"

import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Esqueceu a Senha</h1>
          <p className="text-sm text-muted-foreground">
            Digite seu endereço de e-mail e enviaremos um link para redefinir sua senha
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
