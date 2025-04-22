"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function LoginFormSimple() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("Tentando login com:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de login:", error)
        setError(error.message)
        return
      }

      setMessage("Login bem-sucedido! Redirecionando...")
      console.log("Login bem-sucedido:", data)

      // Redirecionar após login bem-sucedido
      window.location.href = "/dashboard"
    } catch (err: any) {
      console.error("Erro inesperado:", err)
      setError(err.message || "Ocorreu um erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("Tentando criar conta com:", email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: "Novo Usuário",
          },
        },
      })

      if (error) {
        console.error("Erro de cadastro:", error)
        setError(error.message)
        return
      }

      console.log("Cadastro bem-sucedido:", data)
      setMessage("Conta criada com sucesso! Verifique seu email ou faça login.")
    } catch (err: any) {
      console.error("Erro inesperado:", err)
      setError(err.message || "Ocorreu um erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login / Cadastro</h2>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Cadastrar"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          Status da conexão: <span id="connection-status">Verificando...</span>
        </p>
        <button
          onClick={async () => {
            const status = document.getElementById("connection-status")
            if (status) {
              status.textContent = "Testando..."
              try {
                const { data, error } = await supabase.from("subscription_plans").select("count")
                if (error) throw error
                status.textContent = `Conectado (${data.length} planos encontrados)`
                status.className = "text-green-600 font-medium"
              } catch (err) {
                console.error(err)
                status.textContent = "Falha na conexão"
                status.className = "text-red-600 font-medium"
              }
            }
          }}
          className="text-blue-600 hover:underline"
        >
          Testar conexão
        </button>
      </div>
    </div>
  )
}
