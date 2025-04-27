"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ExportData() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState<"csv" | "json">("csv")
  const [selectedData, setSelectedData] = useState({
    calculations: true,
    ideas: false,
    consultations: false,
  })
  const supabase = createClientComponentClient()

  const handleExport = async () => {
    try {
      setLoading(true)

      // Obter usuário atual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Usuário não autenticado")
      }

      const exportData: Record<string, any> = {}

      // Buscar cálculos se selecionado
      if (selectedData.calculations) {
        // Buscar cálculos da tabela original
        const { data: calcData, error: calcError } = await supabase
          .from("calculations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (calcError) throw calcError

        // Buscar cálculos da nova tabela
        const { data: savedCalcData, error: savedCalcError } = await supabase
          .from("saved_calculations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (savedCalcError) throw savedCalcError

        exportData.calculations = calcData || []
        exportData.savedCalculations = savedCalcData || []
      }

      // Buscar ideias se selecionado
      if (selectedData.ideas) {
        const { data: ideasData, error: ideasError } = await supabase
          .from("ideas")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (ideasError) throw ideasError

        exportData.ideas = ideasData || []
      }

      // Buscar consultorias se selecionado
      if (selectedData.consultations) {
        const { data: consultationsData, error: consultationsError } = await supabase
          .from("consultations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (consultationsError) throw consultationsError

        exportData.consultations = consultationsData || []
      }

      // Exportar dados no formato selecionado
      if (exportType === "csv") {
        exportAsCSV(exportData)
      } else {
        exportAsJSON(exportData)
      }

      toast({
        title: "Exportação concluída",
        description: "Seus dados foram exportados com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível exportar os dados.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportAsCSV = (data: Record<string, any[]>) => {
    // Função para converter objeto em linha CSV
    const objectToCSV = (obj: any) => {
      const headers = Object.keys(obj).filter((key) => key !== "data" && key !== "result")
      const values = headers.map((header) => {
        const value = obj[header]
        if (typeof value === "object" && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        return `"${String(value).replace(/"/g, '""')}"`
      })
      return { headers, values }
    }

    // Processar cada tipo de dado
    Object.entries(data).forEach(([key, items]) => {
      if (!items || items.length === 0) return

      // Obter cabeçalhos
      const { headers } = objectToCSV(items[0])

      // Criar conteúdo CSV
      const csvContent = [
        headers.join(","),
        ...items.map((item) => {
          const { values } = objectToCSV(item)
          return values.join(",")
        }),
      ].join("\n")

      // Criar link de download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${key}-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const exportAsJSON = (data: Record<string, any[]>) => {
    // Criar link de download para JSON
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `export-data-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Dados</CardTitle>
        <CardDescription>Exporte seus dados para análise externa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Selecione os dados para exportar</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="calculations"
                  checked={selectedData.calculations}
                  onCheckedChange={(checked) =>
                    setSelectedData((prev) => ({ ...prev, calculations: checked === true }))
                  }
                />
                <Label htmlFor="calculations">Cálculos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ideas"
                  checked={selectedData.ideas}
                  onCheckedChange={(checked) => setSelectedData((prev) => ({ ...prev, ideas: checked === true }))}
                />
                <Label htmlFor="ideas">Ideias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consultations"
                  checked={selectedData.consultations}
                  onCheckedChange={(checked) =>
                    setSelectedData((prev) => ({ ...prev, consultations: checked === true }))
                  }
                />
                <Label htmlFor="consultations">Consultorias</Label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Formato de exportação</h3>
            <RadioGroup
              value={exportType}
              onValueChange={(value) => setExportType(value as "csv" | "json")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleExport}
            disabled={loading || (!selectedData.calculations && !selectedData.ideas && !selectedData.consultations)}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Dados
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
