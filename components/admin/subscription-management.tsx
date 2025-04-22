"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Plus } from "lucide-react"

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

// Mock data for subscriptions
const mockSubscriptions = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    userEmail: "john@example.com",
    plan: "premium",
    status: "active",
    startDate: "2023-01-15",
    renewalDate: "2024-01-15",
    amount: "$9.99",
  },
  {
    id: "2",
    userId: "4",
    userName: "Emily Davis",
    userEmail: "emily@example.com",
    plan: "premium",
    status: "active",
    startDate: "2023-01-05",
    renewalDate: "2024-01-05",
    amount: "$9.99",
  },
  {
    id: "3",
    userId: "5",
    userName: "Michael Wilson",
    userEmail: "michael@example.com",
    plan: "premium",
    status: "active",
    startDate: "2023-04-12",
    renewalDate: "2024-04-12",
    amount: "$9.99",
  },
  {
    id: "4",
    userId: "6",
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    plan: "premium",
    status: "canceled",
    startDate: "2023-02-18",
    renewalDate: "2023-11-20",
    amount: "$9.99",
  },
  {
    id: "5",
    userId: "7",
    userName: "David Brown",
    userEmail: "david@example.com",
    plan: "premium",
    status: "past_due",
    startDate: "2023-03-22",
    renewalDate: "2024-03-22",
    amount: "$9.99",
  },
]

export function SubscriptionManagement() {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditSubscription = (subscriptionId: string) => {
    toast({
      title: "Edit subscription",
      description: `Editing subscription with ID: ${subscriptionId}`,
    })
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    setSubscriptions(
      subscriptions.map((subscription) =>
        subscription.id === subscriptionId ? { ...subscription, status: "canceled" } : subscription,
      ),
    )
    toast({
      title: "Subscription canceled",
      description: "The subscription has been successfully canceled.",
    })
  }

  const handleAddSubscription = () => {
    toast({
      title: "Add subscription",
      description: "Opening subscription creation form.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Subscription Management</CardTitle>
            <CardDescription className="text-white">Manage user subscriptions and billing</CardDescription>
          </div>
          <Button onClick={handleAddSubscription} className="flex items-center gap-1 text-white">
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                <TableHead className="text-white">User</TableHead>
                <TableHead className="text-white">Plan</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Start Date</TableHead>
                <TableHead className="text-white">Renewal Date</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="w-[80px] text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{subscription.userName}</div>
                      <div className="text-sm text-white">{subscription.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{subscription.plan}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subscription.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : subscription.status === "canceled"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{subscription.startDate}</TableCell>
                  <TableCell className="text-white">{subscription.renewalDate}</TableCell>
                  <TableCell className="text-white">{subscription.amount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditSubscription(subscription.id)}
                          className="text-white"
                        >
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
              ))}
              {filteredSubscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-white">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
