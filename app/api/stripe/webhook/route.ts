import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"

import { stripe } from "@/lib/stripe"

// Inicializar o cliente Supabase Admin para operações de banco de dados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  // Processar eventos do Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break
      default:
        console.log(`Evento não processado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}

// Função para lidar com o evento de checkout.session.completed
async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata.userId
  const subscriptionId = session.subscription

  if (userId && subscriptionId) {
    try {
      // Verificar se as tabelas existem
      const { error: tablesError } = await supabaseAdmin.from("subscription_plans").select("count").limit(1)

      if (tablesError) {
        console.error("As tabelas de assinatura podem não existir ainda:", tablesError)
        return
      }

      // Obter detalhes da assinatura
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Obter o plano de assinatura
      const { data: plans } = await supabaseAdmin
        .from("subscription_plans")
        .select("id")
        .eq("stripe_price_id", subscription.items.data[0].price.id)
        .limit(1)

      const planId = plans && plans.length > 0 ? plans[0].id : null

      if (!planId) {
        console.error("Plano não encontrado para o ID de preço:", subscription.items.data[0].price.id)
        return
      }

      // Verificar se já existe uma assinatura ativa para o usuário
      const { data: existingSubscriptions } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")

      // Se existir, atualizar para inativa
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active")
      }

      // Criar nova assinatura
      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: subscription.customer as string,
        plan_id: planId,
        status: "active",
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
    } catch (error) {
      console.error("Erro ao processar checkout.session.completed:", error)
    }
  }
}

// Função para lidar com o evento de customer.subscription.updated
async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Atualizar a assinatura no banco de dados
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq("stripe_subscription_id", subscription.id)
  } catch (error) {
    console.error("Erro ao processar customer.subscription.updated:", error)
  }
}

// Função para lidar com o evento de customer.subscription.deleted
async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Marcar a assinatura como cancelada no banco de dados
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
      })
      .eq("stripe_subscription_id", subscription.id)
  } catch (error) {
    console.error("Erro ao processar customer.subscription.deleted:", error)
  }
}
