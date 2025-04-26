"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form"
import { ArrowLeft } from "lucide-react"

export function YoutubeCalculator() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "", // Adicionado para salvar
    subscribers: "",
    views: "",
    engagement: "",
    contentType: "entertainment",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.subscribers) {
      newErrors.subscribers = "O número de inscritos é obrigatório"
    } else if (isNaN(Number(formData.subscribers)) || Number(formData.subscribers) < 0) {
      newErrors.subscribers = "Insira um número válido de inscritos"
    }

    if (!formData.views) {
      newErrors.views = "O número de visualizações é obrigatório"
    } else if (isNaN(Number(formData.views)) || Number(formData.views) < 0) {
      newErrors.views = "Insira um número válido de visualizações"
    }

    if (!formData.engagement) {
      newErrors.engagement = "A taxa de engajamento é obrigatória"
    } else if (
      isNaN(Number(formData.engagement)) ||
      Number(formData.engagement) < 0 ||
      Number(formData.engagement) > 100
    ) {
      newErrors.engagement = "Insira uma taxa de engajamento válida (0-100)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contentType: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setResult(null)

    try {
      // Calcular valor estimado
      const subscribers = Number.parseInt(formData.subscribers)
      const views = Number.parseInt(formData.views)
      const engagement = Number.parseFloat(formData.engagement)
      const contentType = formData.contentType

      // Base value calculation
      const baseValue = subscribers * 0.05 + views * 0.01

      // Engagement multiplier (higher engagement = higher value)
      const engagementMultiplier = 1 + engagement / 100

      // Content type multiplier
      let contentMultiplier = 1.0
      switch (contentType) {
        case "education":
          contentMultiplier = 1.3 // Educational content often has higher value
          break
        case "entertainment":
          contentMultiplier = 1.2 // Entertainment is valuable but varies
          break
        case "gaming":
          contentMultiplier = 1.1 // Gaming has specific audience
          break
        case "lifestyle":
          contentMultiplier = 1.15 // Lifestyle often has good brand fit
          break
        default:
          contentMultiplier = 1.0
      }

      // Calculate final value
      const estimatedValue = baseValue * engagementMultiplier * contentMultiplier

      // Round to 2 decimal places
      const roundedValue = Math.round(estimatedValue * 100) / 100

      setResult({
        success: true,
        data: {
          estimated_value: roundedValue,
          subscribers,
          views,
          engagement,
          contentType,
        },
      })
    } catch (error) {
      console.error("Erro:", error)
      setResult({ success: false, error: "Ocorreu um erro ao processar o cálculo" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      subscribers: "",
      views: "",
      engagement: "",
      contentType: "entertainment",
    })
    setResult(null)
    setErrors({})
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
      alert("Por favor, digite um nome para este cálculo")
      return
    }

    setLoading(true)

    try {
      // Simulate saving to database
      setTimeout(() => {
        setLoading(false)
        setShowSaveDialog(false)
        setLastSavedAt(new Date().toLocaleTimeString())
        alert("Cálculo salvo com sucesso!")
      }, 1000)
    } catch (error) {
      console.error("Erro ao salvar cálculo:", error)
      alert("Não foi possível salvar o cálculo")
    } finally {
      setLoading(false)
    }
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div>
      {/* Back Button */}
      <Button variant="outline" onClick={handleBack} className="mb-4 flex items-center gap-2">
        <ArrowLeft size={16} />
        Voltar
      </Button>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Calculadora de Valor do YouTube</CardTitle>
          <CardDescription>Preencha os dados do seu canal para calcular seu valor estimado</CardDescription>
        </CardHeader>
        <CardContent>
          {!result?.success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subscribers">Número de Inscritos</Label>
                <Input
                  id="subscribers"
                  name="subscribers"
                  type="number"
                  placeholder="Ex: 10000"
                  value={formData.subscribers}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.subscribers ? "border-red-500" : ""}
                />
                {errors.subscribers && <p className="text-sm text-red-500">{errors.subscribers}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="views">Visualizações Mensais</Label>
                <Input
                  id="views"
                  name="views"
                  type="number"
                  placeholder="Ex: 50000"
                  value={formData.views}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.views ? "border-red-500" : ""}
                />
                {errors.views && <p className="text-sm text-red-500">{errors.views}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="engagement">Taxa de Engajamento (%)</Label>
                <Input
                  id="engagement"
                  name="engagement"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5.2"
                  value={formData.engagement}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.engagement ? "border-red-500" : ""}
                />
                {errors.engagement && <p className="text-sm text-red-500">{errors.engagement}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Tipo de Conteúdo</Label>
                <Select value={formData.contentType} onValueChange={handleSelectChange} disabled={isSubmitting}>
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Selecione o tipo de conteúdo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entertainment">Entretenimento</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Calculando...
                  </>
                ) : (
                  "Calcular Valor"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cálculo Concluído!</h3>
                <div className="text-3xl font-bold text-green-700 mb-4">
                  {formatCurrency(result.data.estimated_value)}
                </div>
                <p className="text-gray-600">
                  Este é o valor estimado do seu canal do YouTube com base nas métricas fornecidas.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Detalhes do Cálculo</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Inscritos:</div>
                  <div className="text-right font-medium">{Number(formData.subscribers).toLocaleString()}</div>

                  <div className="text-gray-600">Visualizações:</div>
                  <div className="text-right font-medium">{Number(formData.views).toLocaleString()}</div>

                  <div className="text-gray-600">Engajamento:</div>
                  <div className="text-right font-medium">{formData.engagement}%</div>

                  <div className="text-gray-600">Tipo de Conteúdo:</div>
                  <div className="text-right font-medium">
                    {formData.contentType === "entertainment" && "Entretenimento"}
                    {formData.contentType === "education" && "Educação"}
                    {formData.contentType === "gaming" && "Gaming"}
                    {formData.contentType === "lifestyle" && "Lifestyle"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button onClick={showSavePrompt} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Cálculo"}
                </Button>
                <Button onClick={toggleHistory} variant="outline">
                  Ver Histórico
                </Button>
                {lastSavedAt && <span className="text-sm text-gray-500">Último salvamento: {lastSavedAt}</span>}
              </div>

              <Button onClick={resetForm} className="w-full">
                Fazer Novo Cálculo
              </Button>
            </div>
          )}

          {result?.success === false && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{result.error || "Ocorreu um erro ao processar o cálculo."}</p>
            </div>
          )}
        </CardContent>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Salvar Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <FormLabel>Nome do Cálculo</FormLabel>
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Digite um nome para identificar este cálculo"
                  />
                </div>
              </CardContent>
              <CardContent className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelSave}>
                  Cancelar
                </Button>
                <Button onClick={saveCalculation} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Dialog */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader className="relative">
                <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={toggleHistory}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </Button>
                <CardTitle>Histórico de Cálculos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">Nenhum cálculo salvo ainda</div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}
