import { createServerClient } from "@supabase/ssr"

// Para uso em getServerSideProps no Pages Router
export function createPagesServerClient(context: { req: any; res: any }) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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

// Para uso em API Routes no Pages Router
export function createPagesAPIClient(context: { req: any; res: any }) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
