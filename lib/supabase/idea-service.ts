import { createUniversalClient } from "./universal-client"

export interface Idea {
  id: number
  title: string
  description: string
  tags: string[]
  color: string
  created_at: string
  created_by: string
}

export async function getAllIdeas() {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching ideas:", error)
    return []
  }

  return data || []
}

export async function createIdea(idea: Omit<Idea, "id" | "created_at">) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("ideas").insert([idea]).select()

  if (error) {
    console.error("Error creating idea:", error)
    throw error
  }

  return data[0]
}

export async function updateIdea(id: number, idea: Partial<Idea>) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("ideas").update(idea).eq("id", id).select()

  if (error) {
    console.error("Error updating idea:", error)
    throw error
  }

  return data[0]
}

export async function deleteIdea(id: number) {
  const supabase = createUniversalClient()

  const { error } = await supabase.from("ideas").delete().eq("id", id)

  if (error) {
    console.error("Error deleting idea:", error)
    throw error
  }

  return true
}
