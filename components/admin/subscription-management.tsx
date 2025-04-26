"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Plus, TrendingUp, Users, CreditCard } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Subscription = {
  id: string
  user_id: string
  user_name: string
  user_email: string
  plan: string
  status: string
  start_date: string
  renewal_date: string | null
  amount: number
}

export function SubscriptionManagement() {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    active: 0,
    canceled: 0,
    monthly_revenue: 0,
    yearly_revenue: 0,
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const supabase = createClientComponentClient()

  // Load subscriptions
  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get subscriptions from database
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })

      if (subscriptionsError) throw new Error(subscriptionsError.message)

      // Enhance with user information
      const enhancedSubscriptions = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          // Get user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", subscription.user_id)
            .single()

          // Get user email
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(subscription.user_id)

          if (userError) {
            console.error("Error fetching user:", userError)
          }

          return {
            id: subscription.id,
            user_id: subscription.user_id,
            user_name: profileData?.full_name || "Unknown User",
            user_email: userData?.user?.email || "unknown@example.com",
            plan: subscription.price_id || "premium",
            status: subscription.status,
            start_date: subscription.created_at,
            renewal_date: subscription.current_period_end,
            amount: subscription.amount ? Number.parseFloat(subscription.amount) / 100 : 9.99,
          }
        }),
      )

      setSubscriptions(enhancedSubscriptions)

      // Calculate stats
      const active = enhancedSubscriptions.filter((sub) => sub.status === "active").length
      const canceled = enhancedSubscriptions.filter((sub) => sub.status === "canceled").length
      const monthlyRevenue = enhancedSubscriptions
        .filter((sub) => sub.status === "active")
        .reduce((sum, sub) => sum + sub.amount, 0)
      const yearlyRevenue = monthlyRevenue * 12

      setStats({
        active,
        canceled,
        monthly_revenue: monthlyRevenue,
        yearly_revenue: yearlyRevenue,
      })
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error)
      setError("Failed to load subscriptions. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsEditDialogOpen(true)
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      // In a real app, this would typically call a Stripe API to cancel the subscription
      const { error } = await supabase.from("subscriptions").update({ status: "canceled" }).eq("id", subscriptionId)

      if (error) throw new Error(error.message)

      setSubscriptions(
        subscriptions.map((subscription) =>
          subscription.id === subscriptionId ? { ...subscription, status: "canceled" } : subscription,
        ),
      )

      toast({
        title: "Subscription canceled",
        description: "The subscription has been successfully canceled.",
      })

      // Update stats
      setStats((prev) => ({
        ...prev,
        active: prev.active - 1,
        canceled: prev.canceled + 1,
      }))
    } catch (error: any) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: `Failed to cancel subscription: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleAddSubscription = () => {
    toast({
      title: "Add subscription",
      description: "This feature is not yet implemented. Users should subscribe through the payment page.",
    })
  }

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.user_email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>Manage user subscriptions and billing</CardDescription>
          </div>
          <Button onClick={handleAddSubscription} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4 shadow dark:bg-blue-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-300">Active Subscriptions</div>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.active}</div>
          </div>
          <div className="rounded-lg bg-red-50 p-4 shadow dark:bg-red-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-red-600 dark:text-red-300">Canceled</div>
              <Users className="h-4 w-4 text-red-600 dark:text-red-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.canceled}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-600 dark:text-green-300">Monthly Revenue</div>
              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 shadow dark:bg-purple-900">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-300">Yearly Projection</div>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(stats.yearly_revenue)}</div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.user_name}</div>
                        <div className="text-sm text-gray-500">{subscription.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{subscription.plan}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          subscription.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                            : subscription.status === "canceled"
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                        variant="outline"
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          {subscription.status === "active" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCancelSubscription(subscription.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <span>Cancel Subscription</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Subscription Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>Update subscription details for {selectedSubscription?.user_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <div className="font-medium">User</div>
                <div>
                  {selectedSubscription?.user_name} ({selectedSubscription?.user_email})
                </div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div>{selectedSubscription?.status}</div>
              </div>
              <div>
                <div className="font-medium">Start Date</div>
                <div>
                  {selectedSubscription?.start_date
                    ? new Date(selectedSubscription.start_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Note: To modify payment details or plan changes, please use the Stripe dashboard.
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
