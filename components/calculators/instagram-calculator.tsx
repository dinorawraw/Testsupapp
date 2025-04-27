"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { saveInstagramCalculation } from "@/app/calculators/instagram/actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  followers: z.coerce.number().min(1, { message: "Número de seguidores é obrigatório" }),
  engagement: z.coerce.number().min(0, { message: "Taxa de engajamento deve ser positiva" }).optional(),
  likes: z.coerce.number().min(0, { message: "Número de likes deve ser positivo" }).optional(),
  comments: z.coerce.number().min(0, { message: "Número de comentários deve ser positivo" }).optional(),
  contentType: z.enum(["post", "story", "reels", "carousel"], {
    required_error: "Selecione o tipo de conteúdo",
  }),
  hasDiscount: z.boolean().default(false),
})

export function InstagramCalculator() {
  const { toast } = useToast()
  const router = useRouter()
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      followers: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      contentType: "post",
      hasDiscount: false,
    },
  })

  const calculateValue = (data: z.infer<typeof formSchema>) => {
    // Base value calculation
    let baseValue = 0

    // Calculate based on followers
    if (data.followers < 10000) {
      baseValue = data.followers * 0.01
    } else if (data.followers < 100000) {
      baseValue = data.followers * 0.02
    } else if (data.followers < 500000) {
      baseValue = data.followers * 0.03
    } else if (data.followers < 1000000) {
      baseValue = data.followers * 0.05
    } else {
      baseValue = data.followers * 0.1
    }

    // Adjust based on engagement rate
    let engagementRate = data.engagement
    if (!engagementRate && data.likes && data.followers > 0) {
      engagementRate = (data.likes / data.followers) * 100
    }

    if (engagementRate) {
      if (engagementRate > 10) {
        baseValue *= 1.5
      } else if (engagementRate > 5) {
        baseValue *= 1.3
      } else if (engagementRate > 3) {
        baseValue *= 1.1
      } else if (engagementRate < 1) {
        baseValue *= 0.8
      }
    }

    // Adjust based on content type
    switch (data.contentType) {
      case "story":
        baseValue *= 0.7
        break
      case "reels":
        baseValue *= 1.5
        break
      case "carousel":
        baseValue *= 1.2
        break
      default:
        break
    }

    // Apply discount if applicable
    if (data.hasDiscount) {
      baseValue *= 0.9
    }

    return Math.round(baseValue * 100) / 100
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsCalculating(true)

    try {
      const value = calculateValue(data)
      setCalculatedValue(value)

      toast({
        title: "Cálculo realizado",
        description: `O valor estimado é R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      })
    } catch (error) {
      toast({
        title: "Erro ao calcular",
        description: "Ocorreu um erro ao processar o cálculo.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSave = async () => {
    if (calculatedValue === null) return

    setIsSaving(true)

    try {
      const formData = form.getValues()
      const result = await saveInstagramCalculation({
        name: formData.name,
        platform: "instagram",
        followers: formData.followers,
        engagement: formData.engagement || 0,
        likes: formData.likes || 0,
        comments: formData.comments || 0,
        content_type: formData.contentType,
        has_discount: formData.hasDiscount,
        estimated_value: calculatedValue,
      })

      if (result.success) {
        toast({
          title: "Cálculo salvo",
          description: "O cálculo foi salvo com sucesso.",
        })

        // Refresh the page to show updated history
        router.refresh()
      } else {
        throw new Error(result.error || "Erro ao salvar cálculo")
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o cálculo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora de Valor para Instagram</CardTitle>
        <CardDescription>
          Calcule o valor estimado para campanhas no Instagram com base nos dados do influenciador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Campanha</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Campanha Verão 2023" {...field} />
                  </FormControl>
                  <FormDescription>Um nome para identificar este cálculo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="followers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Seguidores</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engagement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Engajamento (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Opcional: média de engajamento em porcentagem</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="likes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Média de Likes</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Média de Comentários</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conteúdo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de conteúdo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="post">Post no Feed</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reels">Reels</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasDiscount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Desconto para Agência</FormLabel>
                    <FormDescription>Aplicar desconto de 10% para agências</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isCalculating}>
              {isCalculating ? "Calculando..." : "Calcular Valor"}
            </Button>
          </form>
        </Form>

        {calculatedValue !== null && (
          <div className="mt-6">
            <Separator className="my-4" />
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 text-lg font-medium">Resultado do Cálculo</h3>
              <p className="text-3xl font-bold text-primary">
                R$ {calculatedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Este é o valor estimado para a campanha com base nos dados fornecidos.
              </p>
            </div>

            <Button onClick={handleSave} className="mt-4 w-full" variant="outline" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Cálculo"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
