import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "../database.types"

// Esta função só deve ser usada no App Router (app/)
export const createServerActionSupabaseClient = () => {
  return createServerActionClient<Database>({ cookies })
}

// Esta função pode ser usada no Pages Router (pages/)
export const createServerActionSupabaseClientWithCookies = (cookieStore: any) => {
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}
