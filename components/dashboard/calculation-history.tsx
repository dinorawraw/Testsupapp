import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

interface Calculation {
  id: string
  user_id: string
  type: string
  data: any
  created_at: string
}

interface CalculationHistoryProps {
  calculations?: Calculation[] | null
}

export function CalculationHistory({ calculations = [] }: CalculationHistoryProps) {
  // Garantir que calculations seja sempre um array
  const safeCalculations = Array.isArray(calculations) ? calculations : []

  // Função para formatar o tipo de cálculo
  const formatCalculationType = (type: string) => {
    const types = {
      instagram: "Instagram",
      tiktok: "TikTok",
      youtube: "YouTube",
    }
    return types[type as keyof typeof types] || type
  }

  // Função para formatar o resultado com base no tipo
  const formatResult = (calculation: Calculation) => {
    const { type, data } = calculation

    if (!data) return "N/A"

    switch (type) {
      case "instagram":
        return `R$ ${data.result?.toFixed(2) || "N/A"}`
      case "tiktok":
        return `R$ ${data.result?.toFixed(2) || "N/A"}`
      case "youtube":
        return `R$ ${data.result?.toFixed(2) || "N/A"}`
      default:
        return "N/A"
    }
  }

  // Função para formatar os detalhes com base no tipo
  const formatDetails = (calculation: Calculation) => {
    const { type, data } = calculation

    if (!data) return "N/A"

    switch (type) {
      case "instagram":
        return `Seguidores: ${data.followers || 0}, Engajamento: ${data.engagement || 0}%`
      case "tiktok":
        return `Seguidores: ${data.followers || 0}, Visualizações: ${data.views || 0}`
      case "youtube":
        return `Inscritos: ${data.subscribers || 0}, Visualizações: ${data.views || 0}, Engajamento: ${
          data.engagement || 0
        }%`
      default:
        return "N/A"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Cálculos</CardTitle>
        <CardDescription>Veja seus cálculos recentes de todas as plataformas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista dos seus cálculos recentes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead className="text-right">Valor Estimado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeCalculations.length > 0 ? (
              safeCalculations.map((calculation) => (
                <TableRow key={calculation.id}>
                  <TableCell>{formatDate(calculation.created_at)}</TableCell>
                  <TableCell>{formatCalculationType(calculation.type)}</TableCell>
                  <TableCell>{formatDetails(calculation)}</TableCell>
                  <TableCell className="text-right font-medium">{formatResult(calculation)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum cálculo encontrado. Experimente usar nossas calculadoras!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
