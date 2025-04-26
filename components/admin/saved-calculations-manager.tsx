"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Download, Search, Trash2, BarChart2, TrendingUp, Calculator } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

type SavedCalculation = {
  id: string
  name: string
  user_id: string
  platform: string
  result: number
  created_at: string
  data: any
  user_email?: string
  user_name?: string
}

type ChartData = {
  name: string
  value: number
  color: string
}

export function SavedCalculationsManager() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    averageResult: 0,
    maxResult: 0,
    platforms: {} as Record<string, number>,
    resultsByPlatform: {} as Record<string, number>,
    weeklyData: [] as { date: string; count: number }[],
  })

  const supabase = createClientComponentClient()

  // Load saved calculations
  useEffect(() => {
    async function loadCalculations() {
      try {
        setLoading(true)
        setError(null)

        // Get saved calculations
        const { data: calculationsData, error: calculationsError } = await supabase
          .from("saved_calculations")
          .select("*")
          .order("created_at", { ascending: false })

        if (calculationsError) throw new Error(calculationsError.message)

        // Enhance with user information
        if (calculationsData) {
          const enhancedCalculations = await Promise.all(
            calculationsData.map(async (calc) => {
              // Get user profile
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", calc.user_id)
                .single()

              // Get user email
              const { data: userData } = await supabase.auth.admin.getUserById(calc.user_id)

              return {
                ...calc,
                user_name: profileData?.full_name || "Unknown",
                user_email: userData?.user?.email || "Unknown",
              }
            }),
          )

          setCalculations(enhancedCalculations)
          calculateStats(enhancedCalculations)
        }
      } catch (error: any) {
        console.error("Error loading calculations:", error)
        setError("Error loading saved calculations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadCalculations()
  }, [supabase])

  // Calculate statistics
  const calculateStats = (data: SavedCalculation[]) => {
    if (!data.length) {
      setStats({
        total: 0,
        averageResult: 0,
        maxResult: 0,
        platforms: {},
        resultsByPlatform: {},
        weeklyData: [],
      })
      return
    }

    // Total calculations
    const total = data.length

    // Average and max result
    const results = data.map((calc) => calc.result)
    const averageResult = results.reduce((sum, val) => sum + val, 0) / results.length
    const maxResult = Math.max(...results)

    // Platform distribution
    const platforms: Record<string, number> = {}
    const resultsByPlatform: Record<string, number> = {}

    data.forEach((calc) => {
      // Count platforms
      if (!platforms[calc.platform]) {
        platforms[calc.platform] = 0
      }
      platforms[calc.platform]++

      // Sum results by platform
      if (!resultsByPlatform[calc.platform]) {
        resultsByPlatform[calc.platform] = 0
      }
      resultsByPlatform[calc.platform] += calc.result
    })

    // Weekly data (for the last 7 weeks)
    const weeklyData = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - (i * 7 + 6))

      const endDate = new Date(today)
      endDate.setDate(today.getDate() - i * 7)

      const weekCalculations = data.filter((calc) => {
        const calcDate = new Date(calc.created_at)
        return calcDate >= startDate && calcDate <= endDate
      })

      const weekLabel = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`

      weeklyData.push({
        date: weekLabel,
        count: weekCalculations.length,
      })
    }

    setStats({
      total,
      averageResult,
      maxResult,
      platforms,
      resultsByPlatform,
      weeklyData,
    })
  }

  // Delete calculation
  const deleteCalculation = async (id: string) => {
    try {
      setDeleteLoading(id)

      const { error } = await supabase.from("saved_calculations").delete().eq("id", id)

      if (error) throw new Error(error.message)

      // Update calculations list
      const updatedCalculations = calculations.filter((calc) => calc.id !== id)
      setCalculations(updatedCalculations)
      calculateStats(updatedCalculations)
    } catch (error: any) {
      console.error("Error deleting calculation:", error)
      setError("Error deleting calculation. Please try again later.")
    } finally {
      setDeleteLoading(null)
    }
  }

  // Export calculations as CSV
  const exportCalculations = () => {
    try {
      // Create CSV content
      const headers = ["Name", "Platform", "User", "Email", "Result", "Created At"]
      const csvContent = [
        headers.join(","),
        ...filteredCalculations.map((calc) => {
          return [
            `"${calc.name}"`,
            calc.platform,
            `"${calc.user_name}"`,
            calc.user_email,
            calc.result,
            new Date(calc.created_at).toLocaleString(),
          ].join(",")
        }),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `calculations-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting calculations:", error)
      setError("Error exporting calculations. Please try again later.")
    }
  }

  // Filter calculations
  const filteredCalculations = calculations.filter((calc) => {
    const matchesSearch =
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.user_email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPlatform = platformFilter === "all" || calc.platform === platformFilter

    return matchesSearch && matchesPlatform
  })

  // Get unique platforms for filter
  const platforms = Array.from(new Set(calculations.map((calc) => calc.platform)))

  // Prepare chart data
  const platformChartData: ChartData[] = Object.entries(stats.platforms).map(([platform, count]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: count,
    color: platform === "youtube" ? "#ff0000" : platform === "tiktok" ? "#000000" : "#e1306c",
  }))

  const COLORS = ["#ff0000", "#000000", "#e1306c", "#4267B2", "#1DA1F2", "#8a2be2"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Calculations</CardTitle>
          <CardDescription>View and manage user calculations</CardDescription>
        </div>
        <Button onClick={exportCalculations} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 shadow dark:bg-blue-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Calculations</div>
              <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-600 dark:text-green-300">Average Value</div>
              <BarChart2 className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(stats.averageResult)}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 shadow dark:bg-purple-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-300">Highest Value</div>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(stats.maxResult)}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Platform Distribution */}
          <div className="rounded-lg border p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-medium">Platform Distribution</h3>
            <div className="h-[250px]">
              {platformChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} calculations`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Calculations */}
          <div className="rounded-lg border p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-medium">Weekly Calculations</h3>
            <div className="h-[250px]">
              {stats.weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Calculations" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search calculations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading calculations...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalculations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No calculations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell>{calc.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          calc.platform === "youtube"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : calc.platform === "tiktok"
                              ? "bg-black text-white hover:bg-black"
                              : "bg-pink-100 text-pink-800 hover:bg-pink-100"
                        }
                      >
                        {calc.platform.charAt(0).toUpperCase() + calc.platform.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{calc.user_name}</div>
                      <div className="text-xs text-gray-500">{calc.user_email}</div>
                    </TableCell>
                    <TableCell>R$ {calc.result.toFixed(2)}</TableCell>
                    <TableCell>{new Date(calc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCalculation(calc.id)}
                        disabled={deleteLoading === calc.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
