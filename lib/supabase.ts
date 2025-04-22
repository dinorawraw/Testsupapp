import { createClient } from "@supabase/supabase-js"

// Usando variáveis de ambiente se disponíveis, caso contrário, usando os valores fornecidos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lmtxihtbvsfszywrzgeh.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHhpaHRidnNmc3p5d3J6Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzY4NjksImV4cCI6MjA1OTYxMjg2OX0.Moi9zFo9l0TJV-0ueTC51BPj_HAFQoB3PKVsqmcoZ8U"

// Criando uma única instância do cliente Supabase para reutilização
export const supabase = createClient(supabaseUrl, supabaseKey)

// Para casos em que precisamos do cliente com a chave de serviço (apenas no servidor)
export const getServiceClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY não está definida. Usando a chave anônima.")
    return supabase
  }
  return createClient(supabaseUrl, serviceKey)
}
