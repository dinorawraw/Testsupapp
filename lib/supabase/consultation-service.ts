import { createUniversalClient } from "./universal-client"

export interface Consultation {
  id: number
  title: string
  status: "active" | "scheduled" | "completed"
  scheduled_date?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ConsultationMessage {
  id: number
  consultation_id: number
  content: string
  sender: "user" | "admin"
  timestamp: string
  is_read: boolean
  attachments?: {
    type: "image" | "document"
    url: string
    name: string
  }[]
}

export async function getConsultationsByUserId(userId: string) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching consultations:", error)
    return []
  }

  return data || []
}

export async function getAllConsultations() {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("consultations")
    .select(`
      *,
      user:user_id (
        email,
        id
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all consultations:", error)
    return []
  }

  return data || []
}

export async function getConsultationMessages(consultationId: number) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("consultation_messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("timestamp", { ascending: true })

  if (error) {
    console.error("Error fetching consultation messages:", error)
    return []
  }

  return data || []
}

export async function createConsultation(consultation: Omit<Consultation, "id" | "created_at" | "updated_at">) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("consultations").insert([consultation]).select()

  if (error) {
    console.error("Error creating consultation:", error)
    throw error
  }

  return data[0]
}

export async function updateConsultation(id: number, consultation: Partial<Consultation>) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("consultations")
    .update({
      ...consultation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating consultation:", error)
    throw error
  }

  return data[0]
}

export async function createMessage(message: Omit<ConsultationMessage, "id" | "timestamp">) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("consultation_messages").insert([message]).select()

  if (error) {
    console.error("Error creating message:", error)
    throw error
  }

  return data[0]
}

export async function markMessagesAsRead(consultationId: number, sender: "user" | "admin") {
  const supabase = createUniversalClient()

  const { error } = await supabase
    .from("consultation_messages")
    .update({ is_read: true })
    .eq("consultation_id", consultationId)
    .eq("sender", sender === "user" ? "admin" : "user")

  if (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }

  return true
}

export async function getUnreadMessageCount(consultationId: number, sender: "user" | "admin") {
  const supabase = createUniversalClient()

  const { count, error } = await supabase
    .from("consultation_messages")
    .select("id", { count: "exact", head: true })
    .eq("consultation_id", consultationId)
    .eq("sender", sender === "user" ? "admin" : "user")
    .eq("is_read", false)

  if (error) {
    console.error("Error getting unread message count:", error)
    return 0
  }

  return count || 0
}
