"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  followers: z.string().regex(/^\d+$/, {
    message: "Por favor, digite um número válido de seguidores.",
  }),
  views: z.string().regex(/^\d+$/, {
    message: "Por favor, digite um número válido de visualizações.",
  }),
  likes: z.string().regex(/^\d+$/, {
    message: "Por favor, digite um número válido de curtidas.",
  }),
  comments: z.string().regex(/^\d+$/, {
    message: "Por favor, digite um número válido de comentários.",
  }),
  hasDiscount: z.enum(["yes", "no"]),
})

export default function TikTokCalculatorPage() {
  const { toast } = useToast()
  const [result, setResult] = useState<number | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      followers: "",
      views: "",
      likes: "",
      comments: "",
      hasDiscount: "no",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert string values to numbers
    const followers = Number.parseInt(values.followers) || 0
    const views = Number.parseInt(values.views) || 0
    const likes = Number.parseInt(values.likes) || 0
    const comments = Number.parseInt(values.comments) || 0
    const hasDiscount = values.hasDiscount

    // Calculate engagement rate
    const engagementRate = views > 0 ? (likes + comments) / views : 0

    // Calculate base values
    const baseValue = followers * 0.004
    const viewsValue = views * 0.004
    const likesValue = likes * 0.008
    const commentsValue = comments * 0.08

    // Calculate total value with adjustments
    const calculatedValue = baseValue + viewsValue + likesValue + commentsValue
    const threshold = 10000
    const highValueFactor = 0.4
    const lowValueFactor = 0.24

    const engagementPenalty = engagementRate < 0.05 ? 0.7 : 1

    let adjustedValue =
      calculatedValue > threshold ? calculatedValue * highValueFactor : calculatedValue * lowValueFactor

    adjustedValue = adjustedValue * engagementPenalty

    // Apply discount if needed
    const finalValue = hasDiscount === "yes" ? adjustedValue * 0.9 : adjustedValue

    setResult(finalValue)

    // Save calculation to database (in a real app)
    try {
      // This would be replaced with your actual API call
      console.log("Saving calculation:", {
        platform: "tiktok",
        followers,
        views,
        likes,
        comments,
        hasDiscount,
        estimatedValue: finalValue,
        timestamp: new Date(),
        userId: "current-user-id", // In a real app, you'd get this from auth
      })

      toast({
        title: "Cálculo completo",
        description: "Seu cálculo foi processado.",
      })
    } catch (error) {
      console.error("Error saving calculation:", error)
    }
  }

  const showSavePrompt = () => {
    setShowSaveDialog(true)
    setSaveName("")
  }

  const cancelSave = () => {
    setShowSaveDialog(false)
    setSaveName("")
  }

  const saveCalculation = async () => {
    if (!saveName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um nome para este cálculo",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    // Simulate saving to database
    setTimeout(() => {
      setLoading(false)
      setShowSaveDialog(false)
      setLastSavedAt(new Date().toLocaleTimeString())
      toast({
        title: "Cálculo salvo",
        description: "Seu cálculo foi salvo com sucesso.",
      })
    }, 1000)
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="container max-w-4xl py-10">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-white">
              <Home className="mr-2 h-4 w-4" /> Início
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-8 card-gradient">
        <CardHeader className="border-b gradient-border">
          <CardTitle className="text-2xl text-white">Calculadora TikTok</CardTitle>
          <CardDescription className="text-white">
            Calcule ganhos potenciais para seu conteúdo no TikTok
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="followers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Número de Seguidores</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 10000" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Digite seu número total de seguidores</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Visualizações</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 50000" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Inserir a média de visualizações</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="likes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Curtidas</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 5000" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Inserir a média de curtidas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Comentários</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 500" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Inserir a média de comentários</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Cliente pediu desconto?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no">Não</SelectItem>
                        <SelectItem value="yes">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-white">
                      Caso o cliente retorne pedindo desconto, selecione "Sim" para aplicar um desconto de 10%
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-white">
                Calcular
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result !== null && (
        <>
          <Card className="mb-4 card-gradient">
            <CardHeader className="border-b gradient-border">
              <CardTitle className="text-white">VALOR TOTAL</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="pt-4">
                  {form.watch("hasDiscount") === "yes" && (
                    <div className="flex justify-between items-center text-lg mb-2 text-white">
                      <span>Valor Original:</span>
                      <span className="line-through">R$ {formatCurrency(result / 0.9)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <span>Valor Total{form.watch("hasDiscount") === "yes" ? " com Desconto" : ""}:</span>
                    <span>R$ {formatCurrency(result)}</span>
                  </div>
                  {form.watch("hasDiscount") === "yes" && (
                    <div className="text-sm text-green-500 text-right mt-1">Desconto de 10% aplicado</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <Button onClick={showSavePrompt} disabled={loading} className="text-white">
                  {loading ? "Salvando..." : "Salvar Cálculo"}
                </Button>
                <Button onClick={toggleHistory} variant="outline" className="text-white">
                  Ver Histórico
                </Button>
                {lastSavedAt && <span className="text-sm text-white">Último salvamento: {lastSavedAt}</span>}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full card-gradient">
            <CardHeader>
              <CardTitle className="text-white">Salvar Cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <FormLabel className="text-white">Nome do Cálculo</FormLabel>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Digite um nome para identificar este cálculo"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelSave} className="text-white">
                Cancelar
              </Button>
              <Button onClick={saveCalculation} disabled={loading} className="text-white">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* History Dialog */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto card-gradient">
            <CardHeader className="relative">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={toggleHistory}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
              <CardTitle className="text-white">Histórico de Cálculos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-white">Nenhum cálculo salvo ainda</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
