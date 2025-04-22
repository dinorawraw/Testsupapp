"use client"

import { useState, useEffect } from "react"
import { BarChart, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for calculations
const mockCalculations = [
  {
    id: "1",
    userId: "user1",
    userName: "João Silva",
    userEmail: "joao@example.com",
    platform: "tiktok",
    followers: 50000,
    engagement: 3.2,
    contentType: "video",
    postCount: 1,
    estimatedValue: 80.0,
    timestamp: "2023-05-15T14:30:00Z",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Maria Oliveira",
    userEmail: "maria@example.com",
    platform: "youtube",
    subscribers: 100000,
    views: 25000,
    videoLength: 15,
    niche: "tech",
    estimatedValue: 187.5,
    timestamp: "2023-05-16T09:45:00Z",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Pedro Santos",
    userEmail: "pedro@example.com",
    platform: "tiktok",
    followers: 120000,
    engagement: 4.5,
    contentType: "video",
    postCount: 3,
    estimatedValue: 270.0,
    timestamp: "2023-05-17T16:20:00Z",
  },
  {
    id: "4",
    userId: "user4",
    userName: "Ana Costa",
    userEmail: "ana@example.com",
    platform: "youtube",
    subscribers: 500000,
    views: 75000,
    videoLength: 20,
    niche: "gaming",
    estimatedValue: 450.0,
    timestamp: "2023-05-18T11:10:00Z",
  },
  {
    id: "5",
    userId: "user5",
    userName: "Lucas Ferreira",
    userEmail: "lucas@example.com",
    platform: "tiktok",
    followers: 80000,
    engagement: 2.8,
    contentType: "photo",
    postCount: 2,
    estimatedValue: 134.4,
    timestamp: "2023-05-19T13:25:00Z",
  },
  {
    id: "6",
    userId: "user6",
    userName: "Juliana Almeida",
    userEmail: "juliana@example.com",
    platform: "instagram",
    followers: 150000,
    engagement: 3.5,
    contentType: "post",
    postCount: 1,
    estimatedValue: 210.0,
    timestamp: "2023-05-20T10:15:00Z",
  },
  {
    id: "7",
    userId: "user7",
    userName: "Rafael Souza",
    userEmail: "rafael@example.com",
    platform: "instagram",
    followers: 75000,
    engagement: 4.2,
    contentType: "reel",
    postCount: 2,
    estimatedValue: 189.0,
    timestamp: "2023-05-21T15:30:00Z",
  },
]

export function CalculationData() {
  const [calculations, setCalculations] = useState(mockCalculations)
  const [searchQuery, setSearchQuery] = useState("")
  const [platform, setPlatform] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Extract unique users from calculations
    const uniqueUsers = Array.from(new Set(calculations.map((calc) => calc.userId))).map((userId) => {
      const user = calculations.find((calc) => calc.userId === userId)
      return {
        id: userId,
        name: user?.userName || "Usuário Desconhecido",
      }
    })

    setUsers(uniqueUsers)
  }, [calculations])

  const filteredCalculations = calculations.filter((calc) => {
    // Filter by platform
    if (platform !== "all" && calc.platform !== platform) {
      return false
    }

    // Filter by user
    if (userFilter !== "all" && calc.userId !== userFilter) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        calc.userName?.toLowerCase().includes(searchLower) ||
        calc.userEmail?.toLowerCase().includes(searchLower) ||
        calc.platform.toLowerCase().includes(searchLower) ||
        calc.estimatedValue.toString().includes(searchLower)
      )
    }

    return true
  })

  const exportData = () => {
    // Create CSV content
    const headers = ["ID", "Usuário", "Email", "Plataforma", "Valor Estimado", "Data"]
    const csvContent = [
      headers.join(","),
      ...filteredCalculations.map((calc) =>
        [
          calc.id,
          calc.userName,
          calc.userEmail,
          calc.platform,
          calc.estimatedValue,
          new Date(calc.timestamp).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `calculos-exportados-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate statistics
  const totalCalculations = filteredCalculations.length
  const totalValue = filteredCalculations.reduce((sum, calc) => sum + calc.estimatedValue, 0)
  const averageValue = totalCalculations > 0 ? totalValue / totalCalculations : 0

  // Platform breakdown
  const tiktokCount = filteredCalculations.filter((calc) => calc.platform === "tiktok").length
  const youtubeCount = filteredCalculations.filter((calc) => calc.platform === "youtube").length
  const instagramCount = filteredCalculations.filter((calc) => calc.platform === "instagram").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dados de Cálculos</CardTitle>
              <CardDescription>Visualize e analise os cálculos de todos os usuários</CardDescription>
            </div>
            <Button onClick={exportData} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar Dados</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="space-y-4">
            <TabsList>
              <TabsTrigger value="data">Dados</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cálculos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="all">Todas as Plataformas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">Todos os Usuários</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">{calc.userName}</TableCell>
                        <TableCell>{calc.userEmail}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              calc.platform === "tiktok"
                                ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
                                : calc.platform === "youtube"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                            }`}
                          >
                            {calc.platform}
                          </span>
                        </TableCell>
                        <TableCell>
                          {calc.platform === "tiktok" || calc.platform === "instagram" ? (
                            <span>
                              {calc.followers.toLocaleString()} seguidores, {calc.engagement}% engajamento
                            </span>
                          ) : (
                            <span>
                              {calc.subscribers.toLocaleString()} inscritos, {calc.views.toLocaleString()} visualizações
                            </span>
                          )}
                        </TableCell>
                        <TableCell>R$ {calc.estimatedValue.toFixed(2)}</TableCell>
                        <TableCell>{new Date(calc.timestamp).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {filteredCalculations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhum cálculo encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Cálculos</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCalculations}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {averageValue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Distribuição por Plataforma</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>TikTok:</span>
                        <span>{tiktokCount}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>YouTube:</span>
                        <span>{youtubeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Instagram:</span>
                        <span>{instagramCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 h-[300px] rounded-md border bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de análise seria renderizado aqui</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
