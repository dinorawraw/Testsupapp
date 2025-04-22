import { createClient } from "@supabase/supabase-js"
import { createServerClient as createServerClientSSR } from "@supabase/ssr"

// Singleton para o cliente do lado do cliente
let clientInstance: ReturnType<typeof createClient> | null = null

// Cria um cliente Supabase singleton para uso no lado do cliente
export const createClientComponentClient = () => {
  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined")
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey)
  return clientInstance
}

// Para uso em componentes do servidor no App Router
// Esta função deve ser chamada apenas em Server Components no diretório app/
export const createServerComponentClient = () => {
  // Importamos cookies dinamicamente para evitar o erro
  // Isso garante que next/headers só será importado quando esta função for chamada
  // e apenas em Server Components
  try {
    // Importação dinâmica para evitar o erro durante a compilação
    const { cookies } = require("next/headers")
    const cookieStore = cookies()

    return createServerClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })
  } catch (error) {
    console.error("Error creating server component client:", error)
    // Fallback para ambientes onde next/headers não está disponível
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
}

// Para uso em API Routes do Pages Router
export const createServerPageClient = (context: { req: any; res: any }) => {
  return createServerClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return context.req.cookies[name]
      },
      set(name: string, value: string, options: any) {
        context.res.setHeader("Set-Cookie", `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
      },
      remove(name: string, options: any) {
        context.res.setHeader("Set-Cookie", `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
      },
    },
  })
}

// Para uso em Server Actions e API Routes
export const createServerActionClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
