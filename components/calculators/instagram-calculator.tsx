"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveInstagramCalculation, getInstagramCalculationHistory } from "@/app/calculators/instagram/actions"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  followers: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number of followers.",
  }),
  scope: z.enum(["small", "large"]),
  minReach: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  maxReach: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  engagement: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  licenseDays: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number of days.",
  }),
  hasDiscount: z.enum(["yes", "no"]),
})

type CalculationHistory = {
  id: string
  name: string
  followers: number
  scope?: string
  minReach?: number
  maxReach?: number
  engagement?: number
  licenseDays?: number
  estimated_value: number
  created_at: string
}

export function InstagramCalculator() {
  const { toast } = useToast()
  const [result, setResult] = useState<number | null>(null)
  const [reelsValue, setReelsValue] = useState<number | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        loadHistory(data.user.id)
      }
    }

    checkUser()
  }, [])

  const loadHistory = async (uid: string) => {
    const result = await getInstagramCalculationHistory(uid)
    if (result.success && result.data) {
      setHistory(result.data as CalculationHistory[])
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      followers: "",
      scope: "small",
      minReach: "5",
      maxReach: "50",
      engagement: "0",
      licenseDays: "1",
      hasDiscount: "no",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert string values to numbers
    const followers = Number.parseInt(values.followers)
    const minReach = Number.parseInt(values.minReach)
    const maxReach = Number.parseInt(values.maxReach)
    const engagement = Number.parseInt(values.engagement)
    const licenseDays = Number.parseInt(values.licenseDays)
    const scope = values.scope
    const hasDiscount = values.hasDiscount

    // Calculate base value
    const ratePerFollower = scope === "small" ? 0.014 : 0.008
    const baseValue = followers * ratePerFollower

    // Calculate min reach value
    const minReachValue = (followers * (minReach / 100) * 8) / 1000

    // Calculate max reach value
    const maxReachValue = (followers * (maxReach / 100) * 10) / 1000

    // Calculate license value
    const baseRate = 13.32
    const followersInUnits = followers / 50000
    const licenseValue = baseRate * followersInUnits * licenseDays

    // Calculate total value
    const totalValue = baseValue + minReachValue + maxReachValue + licenseValue

    // Apply discount if needed
    const finalValue = hasDiscount === "yes" ? totalValue * 0.9 : totalValue
    const finalReelsValue = hasDiscount === "yes" ? totalValue * 2 * 0.9 : totalValue * 2

    setResult(finalValue)
    setReelsValue(finalReelsValue)

    toast({
      title: "Calculation complete",
      description: "Your calculation has been processed.",
    })
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
        title: "Error",
        description: "Please enter a name for this calculation",
        variant: "destructive",
      })
      return
    }

    if (!userId || !result) {
      toast({
        title: "Error",
        description: "You need to be logged in to save calculations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const values = form.getValues()

      // Criar FormData para enviar ao servidor
      const formData = new FormData()
      formData.append("name", saveName)
      formData.append("followers", values.followers)
      formData.append("scope", values.scope)
      formData.append("minReach", values.minReach)
      formData.append("maxReach", values.maxReach)
      formData.append("engagement", values.engagement)
      formData.append("licenseDays", values.licenseDays)
      formData.append("hasDiscount", values.hasDiscount)

      const response = await saveInstagramCalculation(formData)

      if (response.success) {
        setShowSaveDialog(false)
        setLastSavedAt(new Date().toLocaleTimeString())
        toast({
          title: "Calculation saved",
          description: "Your calculation has been saved successfully.",
        })

        // Reload history
        if (userId) {
          loadHistory(userId)
        }
      } else {
        throw new Error(response.error || "Error saving calculation")
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast({
        title: "Error",
        description: "Could not save the calculation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
    if (!showHistory && userId) {
      loadHistory(userId)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toFixed(2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")
  }

  return (
    <>
      <Card className="mb-8 card-gradient">
        <CardHeader className="border-b gradient-border">
          <CardTitle className="text-2xl text-white">Calculadora de Publis - Instagram</CardTitle>
          <CardDescription className="text-white">
            Calculate potential earnings for your Instagram content
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
                      <Input placeholder="e.g. 10000" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Enter your total number of followers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Escopo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-white">
                      Se o escopo de entrega for pequeno o valor será cobrado normal, caso seja um escopo maior é
                      adicionado um pequeno desconto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minReach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Alcance Mínimo (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5" {...field} />
                      </FormControl>
                      <FormDescription className="text-white">Porcentagem de alcance mínimo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxReach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Alcance Máximo (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 50" {...field} />
                      </FormControl>
                      <FormDescription className="text-white">Porcentagem de alcance máximo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="engagement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Taxa de Engajamento (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3.0" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Porcentagem de engajamento no seu conteúdo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Dias de Licenciamento de Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1" {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Quantos dias essa campanha vai rodar</FormDescription>
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
                          <SelectValue placeholder="Select option" />
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
              <CardTitle className="text-white">VALORES STORIES</CardTitle>
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

          <Card className="mb-4 card-gradient">
            <CardHeader className="border-b gradient-border">
              <CardTitle className="text-white">VALORES REELS</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="pt-4">
                  {form.watch("hasDiscount") === "yes" && (
                    <div className="flex justify-between items-center text-lg mb-2 text-white">
                      <span>Valor Original:</span>
                      <span className="line-through">R$ {formatCurrency(reelsValue! / 0.9)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <span>Valor Total{form.watch("hasDiscount") === "yes" ? " com Desconto" : ""}:</span>
                    <span>R$ {formatCurrency(reelsValue!)}</span>
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
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card key={item.id} className="bg-gray-800 text-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{item.name || "Instagram Calculation"}</CardTitle>
                        <CardDescription className="text-gray-300">{formatDate(item.created_at)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Seguidores: {item.followers.toLocaleString()}</div>
                          {item.scope && <div>Escopo: {item.scope === "small" ? "Pequeno" : "Grande"}</div>}
                          {item.engagement && <div>Engajamento: {item.engagement}%</div>}
                          <div className="col-span-2 font-bold mt-2">
                            Valor: R$ {formatCurrency(item.estimated_value)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white">Nenhum cálculo salvo ainda</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
