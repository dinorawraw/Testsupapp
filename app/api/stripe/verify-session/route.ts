import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { stripe } from "@/lib/stripe"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "ID de sessão não fornecido" }, { status: 400 })
    }

    // Verificar a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    // Verificar se o pagamento foi bem-sucedido
    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, message: "Pagamento não concluído" }, { status: 400 })
    }

    // Obter o usuário autenticado
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession()

    if (!userSession?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Verificar se a assinatura foi criada no banco de dados
    // Isso normalmente seria feito pelo webhook, mas verificamos aqui também
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userSession.user.id)
      .eq("stripe_subscription_id", session.subscription)
      .single()

    if (!subscription) {
      // Se o webhook ainda não processou, podemos esperar um pouco
      // Em um ambiente de produção, você pode querer implementar uma solução mais robusta
      return NextResponse.json({ success: true, message: "Pagamento confirmado, assinatura em processamento" })
    }

    return NextResponse.json({
      success: true,
      message: "Pagamento confirmado e assinatura ativa",
    })
  } catch (error: any) {
    console.error("Erro ao verificar sessão:", error)
    return NextResponse.json({ error: error.message || "Erro ao verificar sessão" }, { status: 500 })
  }
}
