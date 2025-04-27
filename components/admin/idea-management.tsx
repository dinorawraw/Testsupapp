"use client"

import { useState, useEffect } from "react"
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
import { type Idea, createIdea, deleteIdea, getAllIdeas, updateIdea } from "@/lib/supabase/idea-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Schema for idea form
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
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Load ideas from database
  useEffect(() => {
    async function loadIdeas() {
      try {
        setIsLoading(true)
        const ideasData = await getAllIdeas()
        setIdeas(ideasData)
      } catch (error) {
        console.error("Error loading ideas:", error)
        toast({
          title: "Error",
          description: "Failed to load ideas. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadIdeas()
  }, [toast])

  // Form to create/edit ideas
  const form = useForm<z.infer<typeof ideaFormSchema>>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  })

  // Filter ideas based on search
  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Open dialog to create a new idea
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

  // Open dialog to edit an existing idea
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

  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setCurrentTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  // Delete an idea
  const handleDeleteIdea = async (ideaId: number) => {
    try {
      await deleteIdea(ideaId)
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId))
      toast({
        title: "Ideia excluída",
        description: "A ideia foi excluída com sucesso.",
      })
    } catch (error) {
      console.error("Error deleting idea:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a ideia. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  // Submit form
  async function onSubmit(values: z.infer<typeof ideaFormSchema>) {
    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar ideias.",
          variant: "destructive",
        })
        return
      }

      if (editingIdea) {
        // Update existing idea
        const updatedIdea = await updateIdea(editingIdea.id, {
          title: values.title,
          description: values.description,
          tags: currentTags,
          color: values.color,
        })

        setIdeas((prev) => prev.map((idea) => (idea.id === editingIdea.id ? updatedIdea : idea)))

        toast({
          title: "Ideia atualizada",
          description: "A ideia foi atualizada com sucesso.",
        })
      } else {
        // Create new idea
        const newIdea = await createIdea({
          title: values.title,
          description: values.description,
          tags: currentTags,
          color: values.color,
          created_by: user.id,
        })

        setIdeas((prev) => [newIdea, ...prev])

        toast({
          title: "Ideia criada",
          description: "A nova ideia foi criada com sucesso.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving idea:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a ideia. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredIdeas.length === 0 ? (
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
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteIdea(idea.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-foreground/70">
                    Criado em {new Date(idea.created_at).toLocaleDateString("pt-BR")}
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
