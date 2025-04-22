"use client"

import { useState, useEffect } from "react"
import { Search, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipo para as ideias
interface Idea {
  id: string
  title: string
  description: string
  tags: string[]
  color: string
  createdAt: string
  createdBy: string
}

// Dados de exemplo para as ideias
const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "Série de vídeos sobre tendências de moda",
    description: "Criar uma série semanal explorando as últimas tendências de moda e como incorporá-las no dia a dia.",
    tags: ["moda", "tendências", "série", "semanal"],
    color: "bg-pink-100 dark:bg-pink-900",
    createdAt: "2023-06-15",
    createdBy: "Admin",
  },
  {
    id: "2",
    title: "Tutorial de maquiagem para iniciantes",
    description: "Um guia passo a passo para iniciantes aprenderem técnicas básicas de maquiagem.",
    tags: ["beleza", "tutorial", "maquiagem", "iniciantes"],
    color: "bg-purple-100 dark:bg-purple-900",
    createdAt: "2023-06-18",
    createdBy: "Admin",
  },
  {
    id: "3",
    title: "Desafio de 30 dias de fitness",
    description:
      "Criar um desafio de 30 dias com diferentes exercícios para engajar seguidores interessados em fitness.",
    tags: ["fitness", "desafio", "saúde", "engajamento"],
    color: "bg-blue-100 dark:bg-blue-900",
    createdAt: "2023-06-20",
    createdBy: "Admin",
  },
  {
    id: "4",
    title: "Receitas saudáveis em 15 minutos",
    description: "Série de vídeos curtos mostrando como preparar refeições saudáveis em apenas 15 minutos.",
    tags: ["culinária", "saúde", "receitas", "rápido"],
    color: "bg-green-100 dark:bg-green-900",
    createdAt: "2023-06-22",
    createdBy: "Admin",
  },
  {
    id: "5",
    title: "Dicas de produtividade para criadores de conteúdo",
    description: "Compartilhar estratégias e ferramentas para aumentar a produtividade na criação de conteúdo.",
    tags: ["produtividade", "dicas", "criação", "ferramentas"],
    color: "bg-yellow-100 dark:bg-yellow-900",
    createdAt: "2023-06-25",
    createdBy: "Admin",
  },
  {
    id: "6",
    title: "Tour pelo seu espaço de trabalho",
    description:
      "Mostrar aos seguidores como é seu espaço de trabalho e equipamentos que você usa para criar conteúdo.",
    tags: ["behind-the-scenes", "equipamento", "workspace"],
    color: "bg-orange-100 dark:bg-orange-900",
    createdAt: "2023-06-28",
    createdBy: "Admin",
  },
]

// Extrair todas as tags únicas dos dados de exemplo
const allTags = Array.from(new Set(mockIdeas.flatMap((idea) => idea.tags)))

export function IdeaBoard() {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas)
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>(mockIdeas)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filtrar ideias com base na pesquisa e tags selecionadas
  useEffect(() => {
    let filtered = ideas

    // Filtrar por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.description.toLowerCase().includes(query) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Filtrar por tags selecionadas
    if (selectedTags.length > 0) {
      filtered = filtered.filter((idea) => selectedTags.every((tag) => idea.tags.includes(tag)))
    }

    setFilteredIdeas(filtered)
  }, [ideas, searchQuery, selectedTags])

  // Alternar seleção de tag
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Board de Ideias</h2>
          <p className="text-muted-foreground">Explore ideias de conteúdo para suas redes sociais</p>
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
            placeholder="Pesquisar ideias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Botão para limpar filtros */}
        {(searchQuery || selectedTags.length > 0) && (
          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
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

      {/* Exibição das ideias */}
      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Nenhuma ideia encontrada</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">Tente ajustar seus filtros ou termos de pesquisa.</p>
          <Button onClick={clearFilters}>Limpar Filtros</Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className={`${idea.color} border-none`}>
              <CardHeader>
                <CardTitle>{idea.title}</CardTitle>
                <CardDescription className="text-foreground/70">
                  {new Date(idea.createdAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{idea.description}</p>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className={`rounded-lg p-4 ${idea.color}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <span className="text-sm text-foreground/70">
                    {new Date(idea.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p>{idea.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
