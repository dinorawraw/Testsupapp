import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Cliente para componentes do lado do cliente
export const createClient = () => {
  return createClientComponentClient<Database>()
}

export default createClient
