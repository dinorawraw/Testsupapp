"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, User, Tag, Clock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  },
  {
    id: "3",
    title: "Como monetizar seu canal do YouTube em 2023",
    excerpt: "Guia completo sobre as diferentes formas de monetização disponíveis para criadores no YouTube.",
    content: `
      <p>Monetizar um canal no YouTube vai muito além do Programa de Parceiros. Vamos explorar todas as opções disponíveis em 2023.</p>
      
      <h2>1. Programa de Parceiros do YouTube</h2>
      <p>A forma tradicional de monetização através de anúncios, que agora requer 1.000 inscritos e 4.000 horas de exibição.</p>
      
      <h2>2. Super Chat e Super Stickers</h2>
      <p>Permitem que os espectadores destaquem suas mensagens durante transmissões ao vivo mediante pagamento.</p>
      
      <h2>3. Membros do canal</h2>
      <p>Ofereça benefícios exclusivos para assinantes mensais do seu canal.</p>
      
      <h2>4. YouTube Shorts Fund</h2>
      <p>Monetize conteúdos curtos através do fundo específico para Shorts.</p>
      
      <h2>5. Parcerias com marcas</h2>
      <p>Colaborações pagas com marcas continuam sendo uma das formas mais lucrativas de monetização.</p>
    `,
    coverImage: "/placeholder.svg?height=400&width=600",
    tags: ["youtube", "monetização", "criadores de conteúdo"],
    publishedAt: "2023-06-25",
    author: {
      name: "Roberto Alves",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    readTime: 7,
    hasVideo: true,
  },
]

// Extrair todas as tags únicas dos dados de exemplo
const allTags = Array.from(new Set(mockPosts.flatMap((post) => post.tags)))

export function InsightsBlog() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filtrar posts com base na pesquisa e tags selecionadas
  useEffect(() => {
    let filtered = posts

    // Filtrar por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Filtrar por tags selecionadas
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery, selectedTags])

  // Alternar seleção de tag
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("pt-BR", options)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Insights</h2>
          <p className="text-muted-foreground">Análises e posts sobre conteúdo e tendências</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue="grid"
            className="w-[200px]"
            onValueChange={(value) => setViewMode(value as "grid" | "list")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grade</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Barra de pesquisa */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tags para filtrar */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center mr-2">
          <Tag className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Filtrar por:</span>
        </div>
        {allTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Exibição dos posts */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Nenhum post encontrado</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">Tente ajustar seus filtros ou termos de pesquisa.</p>
          <Button onClick={clearFilters}>Limpar Filtros</Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full">
                <img
                  src={post.coverImage || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                {post.hasVideo && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Vídeo
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime} min de leitura
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3 mt-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && <Badge variant="outline">+{post.tags.length - 3}</Badge>}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{post.author.name}</span>
                </div>
                <Link href={`/insights/${post.id}`}>
                  <Button variant="ghost" size="sm">
                    Ler mais
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-auto md:w-1/3">
                  <img
                    src={post.coverImage || "/placeholder.svg"}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                  {post.hasVideo && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Vídeo
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-4 md:w-2/3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {post.author.name}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime} min de leitura
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Link href={`/insights/${post.id}`}>
                      <Button>Ler mais</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
