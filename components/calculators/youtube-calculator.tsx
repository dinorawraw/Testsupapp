"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { saveYoutubeCalculation } from "@/app/calculators/youtube/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  views: z.coerce.number().min(1, {
    message: "O número de visualizações deve ser pelo menos 1.",
  }),
  cpm: z.coerce.number().min(0.01, {
    message: "O CPM deve ser pelo menos 0.01.",
  }),
  watchTime: z.coerce.number().min(1, {
    message: "O tempo de visualização deve ser pelo menos 1 minuto.",
  }),
})

export function YoutubeCalculator() {
  const { toast } = useToast()
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      views: 1000,
      cpm: 2.5,
      watchTime: 60,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Cálculo do ganho estimado
      const estimatedEarnings = (values.views / 1000) * values.cpm * (values.watchTime / 60)
      setResult(estimatedEarnings)

      // Salvar o cálculo
      const savedResult = await saveYoutubeCalculation({
        views: values.views,
        cpm: values.cpm,
        watchTime: values.watchTime,
        estimatedEarnings,
      })

      if (savedResult.success) {
        toast({
          title: "Cálculo salvo",
          description: "Seu cálculo foi salvo com sucesso.",
        })
      } else {
        throw new Error(savedResult.error || "Erro ao salvar cálculo")
      }
    } catch (error: any) {
      console.error("Erro ao calcular:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar seu cálculo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora de Ganhos do YouTube</CardTitle>
        <CardDescription>
          Calcule seus ganhos estimados com base em visualizações, CPM e tempo de visualização
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="views"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visualizações</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormDescription>Número total de visualizações do vídeo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPM (Custo por Mil Impressões)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="2.50" {...field} />
                  </FormControl>
                  <FormDescription>Valor médio pago por mil visualizações</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="watchTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo de Visualização (minutos)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="60" {...field} />
                  </FormControl>
                  <FormDescription>Tempo médio de visualização em minutos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Calculando..." : "Calcular"}
            </Button>
          </form>
        </Form>
      </CardContent>
      {result !== null && (
        <CardFooter className="flex flex-col items-start">
          <div className="text-lg font-semibold">Resultado:</div>
          <div className="text-2xl font-bold">${result.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Este é um valor estimado com base nos dados fornecidos. Os ganhos reais podem variar.
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
