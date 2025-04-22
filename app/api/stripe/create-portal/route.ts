import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: "ID do cliente não fornecido" }, { status: 400 })
    }

    // Obter o usuário autenticado
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error("Erro ao criar sessão do portal:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar sessão do portal" }, { status: 500 })
  }
}
