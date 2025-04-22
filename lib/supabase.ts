import { createClient } from "@supabase/supabase-js"

// Obter as variáveis de ambiente ou usar valores padrão
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lmtxihtbvsfszywrzgeh.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHhpaHRidnNmc3p5d3J6Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzY4NjksImV4cCI6MjA1OTYxMjg2OX0.Moi9zFo9l0TJV-0ueTC51BPj_HAFQoB3PKVsqmcoZ8U"

// Verificar se as variáveis estão definidas
if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL não está definido")
}

if (!supabaseAnonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definido")
}

// Criar o cliente Supabase com configurações específicas para autenticação
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    debug: true, // Ativar logs de depuração
  },
})

// Função para obter um cliente com a chave de serviço (para operações privilegiadas)
export const getServiceClient = () => {
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHhpaHRidnNmc3p5d3J6Z2VoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAzNjg2OSwiZXhwIjoyMDU5NjEyODY5fQ.otLXiXabRqKce5INokAAiaPmOdD_b_0CmUpU-PcYaKI"

  if (!supabaseServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não está definido")
    throw new Error("Chave de serviço do Supabase não configurada")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Verificar a configuração do cliente
console.log("Cliente Supabase configurado com URL:", supabaseUrl)
