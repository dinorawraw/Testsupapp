"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Edit, Trash, Tag, X, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
]

// Esquema para o formulário de ideias
const ideaFormSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  color: z.string(),
})

export function IdeaManagement() {
  const { toast } = useToast()
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Formulário para criar/editar ideias
  const form = useForm<z.infer<typeof ideaFormSchema>>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  })

  // Filtrar ideias com base na pesquisa
  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Abrir o diálogo para criar uma nova ideia
  const openCreateDialog = () => {
    setEditingIdea(null)
    setCurrentTags([])
    form.reset({
      title: "",
      description: "",
      color: "bg-pink-100 dark:bg-pink-900",
    })
    setIsDialogOpen(true)
  }

  // Abrir o diálogo para editar uma ideia existente
  const openEditDialog = (idea: Idea) => {
    setEditingIdea(idea)
    setCurrentTags([...idea.tags])
    form.reset({
      title: idea.title,
      description: idea.description,
      color: idea.color,
    })
    setIsDialogOpen(true)
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

  // Excluir uma ideia
  const deleteIdea = (ideaId: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId))
    toast({
      title: "Ideia excluída",
      description: "A ideia foi excluída com sucesso.",
    })
  }

  // Enviar o formulário
  function onSubmit(values: z.infer<typeof ideaFormSchema>) {
    if (editingIdea) {
      // Atualizar ideia existente
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === editingIdea.id
            ? {
                ...idea,
                title: values.title,
                description: values.description,
                tags: currentTags,
                color: values.color,
              }
            : idea,
        ),
      )
      toast({
        title: "Ideia atualizada",
        description: "A ideia foi atualizada com sucesso.",
      })
    } else {
      // Criar nova ideia
      const newIdea: Idea = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description,
        tags: currentTags,
        color: values.color,
        createdAt: new Date().toISOString().split("T")[0],
        createdBy: "Admin",
      }
      setIdeas((prev) => [newIdea, ...prev])
      toast({
        title: "Ideia criada",
        description: "A nova ideia foi criada com sucesso.",
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Ideias</CardTitle>
            <CardDescription>Crie e gerencie ideias para o Board de Ideias</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ideia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingIdea ? "Editar Ideia" : "Criar Nova Ideia"}</DialogTitle>
                <DialogDescription>
                  {editingIdea
                    ? "Edite os detalhes da ideia existente."
                    : "Preencha os detalhes para criar uma nova ideia."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título da ideia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite a descrição detalhada da ideia"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma cor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bg-pink-100 dark:bg-pink-900">Rosa</SelectItem>
                            <SelectItem value="bg-purple-100 dark:bg-purple-900">Roxo</SelectItem>
                            <SelectItem value="bg-blue-100 dark:bg-blue-900">Azul</SelectItem>
                            <SelectItem value="bg-green-100 dark:bg-green-900">Verde</SelectItem>
                            <SelectItem value="bg-yellow-100 dark:bg-yellow-900">Amarelo</SelectItem>
                            <SelectItem value="bg-orange-100 dark:bg-orange-900">Laranja</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Selecione uma cor para o card da ideia.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      Adicione tags para categorizar a ideia. Pressione Enter ou clique no botão para adicionar.
                    </FormDescription>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      {editingIdea ? "Salvar Alterações" : "Criar Ideia"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Pesquisar ideias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="space-y-4">
          {filteredIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mt-4 text-lg font-semibold">Nenhuma ideia encontrada</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Tente ajustar seus termos de pesquisa ou crie uma nova ideia.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ideia
              </Button>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <Card key={idea.id} className={`${idea.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(idea)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteIdea(idea.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-foreground/70">
                    Criado em {new Date(idea.createdAt).toLocaleDateString("pt-BR")} por {idea.createdBy}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{idea.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Tag className="h-4 w-4 mr-1" />
                    {idea.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
