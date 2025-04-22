"use client"

import { useState } from "react"
import { BarChart, LineChart, PieChart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AnalyticsDashboard() {
  const { toast } = useToast()
  // This would be fetched from your API in a real application
  const [subscription, setSubscription] = useState({
    tier: "free", // or "premium"
  })

  const handlePremiumFeature = () => {
    if (subscription.tier !== "premium") {
      toast({
        title: "Premium Feature",
        description: "Analytics are only available to premium subscribers.",
        variant: "destructive",
      })
    }
  }

  if (subscription.tier !== "premium") {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <LineChart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Premium Feature</CardTitle>
          <CardDescription className="max-w-md">
            Analytics dashboard is only available for premium subscribers. Upgrade your plan to access detailed insights
            and data visualization tools.
          </CardDescription>
          <Button className="mt-4">Upgrade to Premium</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stream Analytics</CardTitle>
          <CardDescription>View detailed insights and metrics for your streams</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="h-[300px] rounded-md border bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">Analytics chart would render here</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">245</div>
                    <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+3 from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">68%</div>
                    <p className="text-xs text-muted-foreground">+5% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="usage">
              <div className="h-[400px] rounded-md border bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">Usage metrics would render here</p>
              </div>
            </TabsContent>
            <TabsContent value="performance">
              <div className="h-[400px] rounded-md border bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground">Performance metrics would render here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
