"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/database"

interface Calculation {
  id: string
  platform: string
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
  users: {
    id: string
    name: string
    email: string
  }
}

interface SavedCalculation {
  id: string
  platform: string
  name: string
  data: Record<string, any>
  result: number
  created_at: string
  users: {
    id: string
    name: string
    email: string
  }
}

export function CalculationData() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("original")

  useEffect(() => {
    async function fetchCalculations() {
      try {
        setLoading(true)

        // Buscar cálculos da tabela original
        const { data: calcData, error: calcError } = await supabase
          .from("calculations")
          .select(`
            *,
            users (
              id,
              name,
              email
            )
          `)
          .order("created_at", { ascending: false })

        if (calcError) {
          throw calcError
        }

        // Buscar cálculos da nova tabela
        const { data: savedCalcData, error: savedCalcError } = await supabase
          .from("saved_calculations")
          .select(`
            *,
            users (
              id,
              name,
              email
            )
          `)
          .order("created_at", { ascending: false })

        if (savedCalcError) {
          throw savedCalcError
        }

        setCalculations(calcData || [])
        setSavedCalculations(savedCalcData || [])
      } catch (err) {
        console.error("Erro ao buscar cálculos:", err)
        setError("Erro ao carregar dados de cálculos")
      } finally {
        setLoading(false)
      }
    }

    fetchCalculations()
  }, [])

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
        <CardTitle>Dados de Cálculos</CardTitle>
        <CardDescription>Visualize todos os cálculos realizados pelos usuários na plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="original" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="original">Tabela Original</TabsTrigger>
            <TabsTrigger value="new">Nova Estrutura</TabsTrigger>
          </TabsList>

          <TabsContent value="original">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : calculations.length === 0 ? (
              <div className="text-center p-4">Nenhum cálculo encontrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Tipo de Conteúdo</TableHead>
                      <TableHead>Métricas</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <div className="font-medium">{calc.users?.name || "Usuário Desconhecido"}</div>
                          <div className="text-sm text-gray-500">{calc.users?.email || "-"}</div>
                        </TableCell>
                        <TableCell>{getPlatformName(calc.platform)}</TableCell>
                        <TableCell>{getContentTypeName(calc.content_type)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {calc.subscribers && (
                              <div className="text-sm">
                                <span className="font-medium">Inscritos:</span> {calc.subscribers.toLocaleString()}
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
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(calc.estimated_value)}</TableCell>
                        <TableCell>{formatDate(calc.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center p-4">Nenhum cálculo encontrado na nova estrutura.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Dados</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedCalculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <div className="font-medium">{calc.users?.name || "Usuário Desconhecido"}</div>
                          <div className="text-sm text-gray-500">{calc.users?.email || "-"}</div>
                        </TableCell>
                        <TableCell>{getPlatformName(calc.platform)}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
