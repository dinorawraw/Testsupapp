import { createClient } from "@supabase/supabase-js"

// Cliente Supabase para uso em ações do servidor sem depender de next/headers
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
