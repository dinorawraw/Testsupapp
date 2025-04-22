"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Edit, Trash, X, Save, Image, Video, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipo para os posts
interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  tags: string[]
  publishedAt: string
  author: {
    name: string
    avatar: string
  }
  readTime: number
  hasVideo: boolean
  videoEmbed?: string
}

// Dados de exemplo para os posts
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Como aumentar seu engajamento no Instagram em 2023",
    excerpt: "Descubra as estratégias mais eficazes para aumentar o engajamento do seu perfil no Instagram este ano.",
    content: `
      <p>O Instagram continua sendo uma das plataformas mais importantes para criadores de conteúdo. Neste artigo, vamos explorar estratégias comprovadas para aumentar seu engajamento em 2023.</p>
      
      <h2>1. Consistência é chave</h2>
      <p>Postar regularmente é fundamental para manter seu público engajado. Estabeleça um calendário de conteúdo e siga-o consistentemente.</p>
      
      <h2>2. Aproveite todos os formatos</h2>
      <p>Utilize todos os formatos disponíveis: feed, stories, reels e lives. Cada formato atinge diferentes segmentos do seu público.</p>
      
      <h2>3. Interaja com sua audiência</h2>
      <p>Responda comentários, mensagens e crie conteúdo que incentive a participação dos seguidores.</p>
      
      <h2>4. Analise seus dados</h2>
      <p>Use as ferramentas de análise para entender o que funciona melhor com seu público e ajuste sua estratégia de acordo.</p>
    `,
    coverImage: "/placeholder.svg?height=400&width=600",
    tags: ["instagram", "engajamento", "redes sociais", "dicas"],
    publishedAt: "2023-06-15",
    author: {
      name: "Ana Silva",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    readTime: 5,
    hasVideo: false,
  },
  {
    id: "2",
    title: "Tendências de conteúdo para TikTok que estão bombando",
    excerpt: "Conheça as tendências de conteúdo que estão gerando milhões de visualizações no TikTok atualmente.",
    content: `
      <p>O TikTok continua revolucionando a forma como consumimos conteúdo. Vamos explorar as tendências que estão dominando a plataforma em 2023.</p>
      
      <h2>1. Storytelling em formato curto</h2>
      <p>Histórias cativantes contadas em 15-60 segundos estão entre os conteúdos mais virais.</p>
      
      <h2>2. Tutoriais rápidos</h2>
      <p>Tutoriais que ensinam habilidades úteis em poucos segundos têm alto potencial de compartilhamento.</p>
      
      <h2>3. Desafios de transição</h2>
      <p>Vídeos com transições criativas continuam sendo extremamente populares e engajantes.</p>
      
      <h2>4. Conteúdo educativo</h2>
      <p>O "EduTok" está em alta, com criadores compartilhando conhecimentos de forma divertida e acessível.</p>
      
      <h2>5. Áudios virais</h2>
      <p>Utilizar áudios em tendência continua sendo uma das melhores formas de alcançar o algoritmo.</p>
    `,
    coverImage: "/placeholder.svg?height=400&width=600",
    tags: ["tiktok", "tendências", "conteúdo viral", "dicas"],
    publishedAt: "2023-06-20",
    author: {
      name: "Carlos Mendes",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    readTime: 4,
    hasVideo: true,
    videoEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
]

// Esquema para o formulário de posts
const postFormSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres.",
  }),
  excerpt: z.string().min(10, {
    message: "O resumo deve ter pelo menos 10 caracteres.",
  }),
  content: z.string().min(50, {
    message: "O conteúdo deve ter pelo menos 50 caracteres.",
  }),
  coverImage: z.string().url({
    message: "Por favor, insira uma URL válida para a imagem de capa.",
  }),
  readTime: z.string().regex(/^\d+$/, {
    message: "Por favor, insira um número válido.",
  }),
  hasVideo: z.boolean(),
  videoEmbed: z.string().optional(),
})

export function BlogManagement() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  // Formulário para criar/editar posts
  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      coverImage: "/placeholder.svg?height=400&width=600",
      readTime: "5",
      hasVideo: false,
      videoEmbed: "",
    },
  })

  // Observar mudanças no campo hasVideo
  const hasVideo = form.watch("hasVideo")

  // Filtrar posts com base na pesquisa
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Abrir o diálogo para criar um novo post
  const openCreateDialog = () => {
    setEditingPost(null)
    setCurrentTags([])
    form.reset({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "/placeholder.svg?height=400&width=600",
      readTime: "5",
      hasVideo: false,
      videoEmbed: "",
    })
    setIsDialogOpen(true)
    setPreviewMode(false)
  }

  // Abrir o diálogo para editar um post existente
  const openEditDialog = (post: Post) => {
    setEditingPost(post)
    setCurrentTags([...post.tags])
    form.reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      readTime: post.readTime.toString(),
      hasVideo: post.hasVideo,
      videoEmbed: post.videoEmbed || "",
    })
    setIsDialogOpen(true)
    setPreviewMode(false)
  }

  // Adicionar uma nova tag
  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  // Remover uma tag
  const removeTag = (tagToRemove: string) => {
    setCurrentTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  // Excluir um post
  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    toast({
      title: "Post excluído",
      description: "O post foi excluído com sucesso.",
    })
  }

  // Alternar entre modo de edição e visualização
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
  }

  // Enviar o formulário
  function onSubmit(values: z.infer<typeof postFormSchema>) {
    if (editingPost) {
      // Atualizar post existente
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: values.title,
                excerpt: values.excerpt,
                content: values.content,
                coverImage: values.coverImage,
                tags: currentTags,
                readTime: Number.parseInt(values.readTime),
                hasVideo: values.hasVideo,
                videoEmbed: values.hasVideo ? values.videoEmbed : undefined,
              }
            : post,
        ),
      )
      toast({
        title: "Post atualizado",
        description: "O post foi atualizado com sucesso.",
      })
    } else {
      // Criar novo post
      const newPost: Post = {
        id: Date.now().toString(),
        title: values.title,
        excerpt: values.excerpt,
        content: values.content,
        coverImage: values.coverImage,
        tags: currentTags,
        publishedAt: new Date().toISOString().split("T")[0],
        author: {
          name: "Admin",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        readTime: Number.parseInt(values.readTime),
        hasVideo: values.hasVideo,
        videoEmbed: values.hasVideo ? values.videoEmbed : undefined,
      }
      setPosts((prev) => [newPost, ...prev])
      toast({
        title: "Post criado",
        description: "O novo post foi criado com sucesso.",
      })
    }
    setIsDialogOpen(false)
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("pt-BR", options)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Blog</CardTitle>
            <CardDescription>Crie e gerencie posts para o blog de Insights</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Editar Post" : "Criar Novo Post"}</DialogTitle>
                <DialogDescription>
                  {editingPost
                    ? "Edite os detalhes do post existente."
                    : "Preencha os detalhes para criar um novo post."}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="edit" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="edit" onClick={() => setPreviewMode(false)}>
                      Editar
                    </TabsTrigger>
                    <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
                      Visualizar
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="edit">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite o título do post" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resumo</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Digite um breve resumo do post"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Este resumo será exibido na listagem de posts.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Digite o conteúdo completo do post (suporta HTML)"
                                className="min-h-[200px] font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Você pode usar HTML para formatar o conteúdo.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Imagem de Capa</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input placeholder="URL da imagem de capa" {...field} />
                                  <Button type="button" variant="outline" size="icon">
                                    <Image className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>Insira a URL da imagem de capa do post.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="readTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tempo de Leitura (minutos)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormDescription>Estimativa de tempo para ler o post.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="hasVideo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Incluir Vídeo</FormLabel>
                              <FormDescription>Ative esta opção se o post contém um vídeo incorporado.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {hasVideo && (
                        <FormField
                          control={form.control}
                          name="videoEmbed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL de Incorporação do Vídeo</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input placeholder="URL de incorporação do vídeo (YouTube, Vimeo, etc.)" {...field} />
                                  <Button type="button" variant="outline" size="icon">
                                    <Video className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Insira a URL de incorporação do vídeo (ex: https://www.youtube.com/embed/ID_DO_VIDEO).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <div>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            placeholder="Adicionar tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addTag()
                              }
                            }}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentTags.map((tag) => (
                            <Badge key={tag} className="flex items-center gap-1">
                              {tag}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          Adicione tags para categorizar o post. Pressione Enter ou clique no botão para adicionar.
                        </FormDescription>
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          {editingPost ? "Salvar Alterações" : "Publicar Post"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-lg p-6 space-y-6">
                    <div className="relative">
                      <img
                        src={form.getValues("coverImage") || "/placeholder.svg"}
                        alt="Imagem de capa"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {form.getValues("hasVideo") && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Vídeo
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold">{form.getValues("title")}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Admin</span>
                        <span>{new Date().toLocaleDateString("pt-BR")}</span>
                        <span>{form.getValues("readTime")} min de leitura</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentTags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground">{form.getValues("excerpt")}</p>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.getValues("content") }}
                    />
                    {form.getValues("hasVideo") && form.getValues("videoEmbed") && (
                      <div className="aspect-video">
                        <iframe
                          src={form.getValues("videoEmbed")}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Pesquisar posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mt-4 text-lg font-semibold">Nenhum post encontrado</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Tente ajustar seus termos de pesquisa ou crie um novo post.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/4">
                    <img
                      src={post.coverImage || "/placeholder.svg"}
                      alt={post.title}
                      className="h-48 w-full object-cover md:h-full"
                    />
                    {post.hasVideo && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Vídeo
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col p-4 md:w-3/4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground my-2">
                      <span>{post.author.name}</span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime} min de leitura</span>
                    </div>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="w-fit mt-auto" onClick={() => openEditDialog(post)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver/Editar Post
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
