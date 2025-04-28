"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveYoutubeCalculation } from "@/app/calculators/youtube/actions"

const formSchema = z.object({
  subscribers: z.coerce.number().min(0, {
    message: "O número de inscritos deve ser maior ou igual a 0.",
  }),
  views: z.coerce.number().min(0, {
    message: "O número de visualizações deve ser maior ou igual a 0.",
  }),
  engagement: z.coerce.number().min(0).max(100, {
    message: "A taxa de engajamento deve estar entre 0 e 100.",
  }),
})

export function YoutubeCalculator() {
  const { toast } = useToast()
  const router = useRouter()
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscribers: 0,
      views: 0,
      engagement: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Cálculo do valor estimado
      const baseValue = values.subscribers * 0.01 + values.views * 0.001
      const engagementMultiplier = 1 + values.engagement / 100
      const estimatedValue = baseValue * engagementMultiplier

      // Arredondar para 2 casas decimais
      const roundedValue = Math.round(estimatedValue * 100) / 100

      setResult(roundedValue)

      // Salvar o cálculo
      await saveYoutubeCalculation({
        subscribers: values.subscribers,
        views: values.views,
        engagement: values.engagement,
        result: roundedValue,
      })

      toast({
        title: "Cálculo realizado com sucesso",
        description: "O valor estimado foi calculado e salvo.",
      })

      // Revalidar a página do dashboard para mostrar o novo cálculo
      router.refresh()
    } catch (error) {
      console.error("Erro ao calcular valor:", error)
      toast({
        title: "Erro ao calcular",
        description: "Ocorreu um erro ao calcular o valor estimado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Valor do YouTube</CardTitle>
        <CardDescription>
          Calcule o valor estimado do seu canal do YouTube com base em métricas importantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="subscribers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Inscritos</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>O número total de inscritos no seu canal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="views"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visualizações Mensais</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>O número médio de visualizações mensais.</FormDescription>
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
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    A taxa de engajamento (likes, comentários, compartilhamentos) em porcentagem.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Calculando..." : "Calcular Valor"}
            </Button>
          </form>
        </Form>
      </CardContent>
      {result !== null && (
        <CardFooter className="flex flex-col items-start">
          <div className="text-lg font-semibold">Resultado:</div>
          <div className="text-2xl font-bold">R$ {result.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Este é um valor estimado com base nas métricas fornecidas.
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
