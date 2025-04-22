import LoginFormSimple from "@/components/login-form-simple"

export default function LoginTestePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Teste de Login</h1>
        <p className="text-gray-600 text-center mb-8">
          Esta é uma página simplificada para testar a autenticação com Supabase
        </p>
        <LoginFormSimple />
      </div>
    </div>
  )
}
