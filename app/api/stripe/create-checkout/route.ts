import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()

    // Verificar se o priceId foi fornecido
    if (!priceId) {
      return NextResponse.json({ error: "ID de preço não fornecido" }, { status: 400 })
    }

    // Obter o usuário autenticado
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Criar a sessão de checkout do Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar o pagamento" }, { status: 500 })
  }
}
