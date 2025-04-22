import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Bem-vindo</h1>
          <p className="text-sm text-white">Digite suas credenciais para entrar na sua conta</p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-white">
          <a href="/register" className="hover:text-rosa underline underline-offset-4">
            Não tem uma conta? Cadastre-se
          </a>
        </p>
        <p className="px-8 text-center text-sm text-white">
          <a href="/forgot-password" className="hover:text-azul underline underline-offset-4">
            Esqueceu sua senha?
          </a>
        </p>
      </div>
    </div>
  )
}
