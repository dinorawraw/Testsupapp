import { createUniversalClient } from "./universal-client"

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  cover_image: string
  tags: string[]
  published_at: string
  author_id: string
  author_name: string
  author_avatar: string
  read_time: number
  has_video: boolean
  video_embed?: string
}

export async function getAllBlogPosts() {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }

  return data || []
}

export async function getBlogPostById(id: number) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching blog post with id ${id}:`, error)
    return null
  }

  return data
}

export async function createBlogPost(post: Omit<BlogPost, "id">) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("blog_posts").insert([post]).select()

  if (error) {
    console.error("Error creating blog post:", error)
    throw error
  }

  return data[0]
}

export async function updateBlogPost(id: number, post: Partial<BlogPost>) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase.from("blog_posts").update(post).eq("id", id).select()

  if (error) {
    console.error("Error updating blog post:", error)
    throw error
  }

  return data[0]
}

export async function deleteBlogPost(id: number) {
  const supabase = createUniversalClient()

  const { error } = await supabase.from("blog_posts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting blog post:", error)
    throw error
  }

  return true
}
