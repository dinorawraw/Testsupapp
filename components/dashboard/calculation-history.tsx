"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase/database"

interface Calculation {
  id: string
  platform: string
  name?: string
  followers?: number
  engagement?: number
  views?: number
  subscribers?: number
  content_type?: string
  likes?: number
  comments?: number
  has_discount?: boolean
  estimated_value: number
  created_at: string
}

interface SavedCalculation {
  id: string
  platform: string
  name: string
  data: Record<string, any>
  result: number
  created_at: string
}

export function CalculationHistory() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchCalculations() {
      try {
        setLoading(true)

        // Obter usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("Usuário não autenticado")
          return
        }

        // Buscar cálculos da tabela original
        const { data: calcData, error: calcError } = await supabase
          .from("calculations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (calcError) {
          throw calcError
        }

        // Buscar cálculos da nova tabela
        const { data: savedCalcData, error: savedCalcError } = await supabase
          .from("saved_calculations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (savedCalcError) {
          throw savedCalcError
        }

        setCalculations(calcData || [])
        setSavedCalculations(savedCalcData || [])
      } catch (err) {
        console.error("Erro ao buscar cálculos:", err)
        setError("Erro ao carregar histórico de cálculos")
      } finally {
        setLoading(false)
      }
    }

    fetchCalculations()
  }, [])

  // Filtrar cálculos por plataforma
  const filteredCalculations =
    activeTab === "all" ? calculations : calculations.filter((calc) => calc.platform === activeTab)

  const filteredSavedCalculations =
    activeTab === "all" ? savedCalculations : savedCalculations.filter((calc) => calc.platform === activeTab)

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Função para formatar o valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Função para excluir um cálculo
  const deleteCalculation = async (id: string, isNewTable = false) => {
    try {
      const table = isNewTable ? "saved_calculations" : "calculations"
      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) {
        throw error
      }

      // Atualizar estado após exclusão
      if (isNewTable) {
        setSavedCalculations((prev) => prev.filter((calc) => calc.id !== id))
      } else {
        setCalculations((prev) => prev.filter((calc) => calc.id !== id))
      }
    } catch (err) {
      console.error("Erro ao excluir cálculo:", err)
      setError("Erro ao excluir cálculo")
    }
  }

  // Função para obter o nome da plataforma
  const getPlatformName = (platform: string) => {
    const platforms: Record<string, string> = {
      youtube: "YouTube",
      instagram: "Instagram",
      tiktok: "TikTok",
    }
    return platforms[platform] || platform
  }

  // Função para obter o nome do tipo de conteúdo
  const getContentTypeName = (contentType?: string) => {
    if (!contentType) return "-"

    const contentTypes: Record<string, string> = {
      entertainment: "Entretenimento",
      education: "Educação",
      gaming: "Gaming",
      lifestyle: "Lifestyle",
    }
    return contentTypes[contentType] || contentType
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Cálculos</CardTitle>
        <CardDescription>Visualize todos os seus cálculos anteriores.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : filteredCalculations.length === 0 && filteredSavedCalculations.length === 0 ? (
              <div className="text-center p-4">Nenhum cálculo encontrado.</div>
            ) : (
              <div className="space-y-8">
                {/* Tabela para cálculos da tabela original */}
                {filteredCalculations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cálculos (Tabela Original)</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plataforma</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Métricas</TableHead>
                            <TableHead>Valor Estimado</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCalculations.map((calc) => (
                            <TableRow key={calc.id}>
                              <TableCell>
                                <Badge variant="outline">{getPlatformName(calc.platform)}</Badge>
                              </TableCell>
                              <TableCell>{calc.name || "-"}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {calc.subscribers && (
                                    <div className="text-sm">
                                      <span className="font-medium">Inscritos:</span>{" "}
                                      {calc.subscribers.toLocaleString()}
                                    </div>
                                  )}
                                  {calc.views && (
                                    <div className="text-sm">
                                      <span className="font-medium">Visualizações:</span> {calc.views.toLocaleString()}
                                    </div>
                                  )}
                                  {calc.followers && (
                                    <div className="text-sm">
                                      <span className="font-medium">Seguidores:</span> {calc.followers.toLocaleString()}
                                    </div>
                                  )}
                                  {calc.engagement && (
                                    <div className="text-sm">
                                      <span className="font-medium">Engajamento:</span> {calc.engagement.toFixed(2)}%
                                    </div>
                                  )}
                                  {calc.content_type && (
                                    <div className="text-sm">
                                      <span className="font-medium">Tipo:</span> {getContentTypeName(calc.content_type)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(calc.estimated_value)}</TableCell>
                              <TableCell>{formatDate(calc.created_at)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCalculation(calc.id)}
                                  title="Excluir cálculo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tabela para cálculos da nova tabela */}
                {filteredSavedCalculations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cálculos (Nova Estrutura)</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plataforma</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Dados</TableHead>
                            <TableHead>Valor Estimado</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSavedCalculations.map((calc) => (
                            <TableRow key={calc.id}>
                              <TableCell>
                                <Badge variant="outline">{getPlatformName(calc.platform)}</Badge>
                              </TableCell>
                              <TableCell>{calc.name}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {Object.entries(calc.data).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium">{key}:</span>{" "}
                                      {typeof value === "number" && key === "engagement"
                                        ? `${value.toFixed(2)}%`
                                        : typeof value === "number"
                                          ? value.toLocaleString()
                                          : String(value)}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(calc.result)}</TableCell>
                              <TableCell>{formatDate(calc.created_at)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCalculation(calc.id, true)}
                                  title="Excluir cálculo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
