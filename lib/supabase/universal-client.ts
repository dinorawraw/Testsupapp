import { createClient } from "@supabase/supabase-js"

// Cliente Supabase universal que não depende de cookies ou headers
export const createUniversalClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
