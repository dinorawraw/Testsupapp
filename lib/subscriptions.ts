import { createClient } from "@supabase/supabase-js"
import { stripe } from "./stripe"

// Inicializar o cliente Supabase Admin para operações de banco de dados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Erro ao obter assinatura do usuário:", error)
    return null
  }
}

export async function createCustomerPortalSession(customerId: string) {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error("Erro ao criar sessão do portal do cliente:", error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    // Cancelar a assinatura no Stripe
    await stripe.subscriptions.cancel(subscriptionId)

    // Atualizar o status da assinatura no banco de dados
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscriptionId)

    return { success: true }
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error)
    throw error
  }
}

export async function isUserPremium(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)

    if (!subscription) {
      return false
    }

    return subscription.subscription_plans.name === "premium" && subscription.status === "active"
  } catch (error) {
    console.error("Erro ao verificar se o usuário é premium:", error)
    return false
  }
}
