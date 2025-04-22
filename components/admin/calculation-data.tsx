"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllCalculations } from "@/lib/supabase/database"

interface Calculation {
  id: string
  platform: string
  followers?: number
  engagement?: number
  views?: number
  subscribers?: number
  content_type?: string
  estimated_value: number
  created_at: string
  users: {
    id: string
    name: string
    email: string
  }
}

export function CalculationData() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCalculations() {
      try {
        const data = await getAllCalculations()
        setCalculations(data as Calculation[])
      } catch (err) {
        setError("Erro ao carregar os dados de cálculos")
        console.error(err)
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
                      <div className="font-medium">{calc.users.name}</div>
                      <div className="text-sm text-gray-500">{calc.users.email}</div>
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
      </CardContent>
    </Card>
  )
}
