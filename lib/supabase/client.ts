import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Cria um cliente Supabase singleton para uso no lado do cliente
export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Para uso em componentes do servidor
export const createServerComponentClient = () => {
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Para uso em Server Actions e API Routes
export const createServerActionClient = () => {
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
