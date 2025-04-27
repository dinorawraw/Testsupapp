"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Trash, UserPlus, Shield, User } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().min(1, { message: "Please enter a name" }),
  role: z.enum(["user", "admin"], { required_error: "Please select a role" }),
})

type UserWithProfile = {
  id: string
  email: string
  fullName: string
  role: "user" | "admin"
  status: string
  subscription: "free" | "premium" | null
  createdAt: string
}

export function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({ total: 0, admins: 0, premium: 0 })

  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "user",
    },
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser && isEditing) {
      form.setValue("email", selectedUser.email)
      form.setValue("fullName", selectedUser.fullName)
      form.setValue("role", selectedUser.role)
    }
  }, [selectedUser, isEditing, form])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get users from auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) throw new Error(authError.message)

      const enhancedUsers: UserWithProfile[] = []

      // For each user, get their profile info
      for (const user of authData.users) {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError)
        }

        // Get subscription data
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single()

        enhancedUsers.push({
          id: user.id,
          email: user.email || "",
          fullName: profileData?.full_name || "Unnamed User",
          role: profileData?.role || "user",
          status: user.banned ? "banned" : user.confirmed_at ? "active" : "pending",
          subscription: subscriptionData?.status === "active" ? "premium" : "free",
          createdAt: user.created_at || "",
        })
      }

      setUsers(enhancedUsers)

      // Calculate stats
      setStats({
        total: enhancedUsers.length,
        admins: enhancedUsers.filter((user) => user.role === "admin").length,
        premium: enhancedUsers.filter((user) => user.subscription === "premium").length,
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user from auth.users
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
      if (deleteAuthError) throw new Error(deleteAuthError.message)

      // Delete user profile
      const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (deleteProfileError) throw new Error(deleteProfileError.message)

      setUsers(users.filter((user) => user.id !== userId))

      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      })
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: UserWithProfile) => {
    setSelectedUser(user)
    setIsEditing(true)
    setIsUserDialogOpen(true)
  }

  const handleAddUser = () => {
    form.reset()
    setSelectedUser(null)
    setIsEditing(false)
    setIsUserDialogOpen(true)
  }

  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (isEditing && selectedUser) {
        // Update user profile only
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: data.fullName,
            role: data.role,
          })
          .eq("id", selectedUser.id)

        if (updateError) throw new Error(updateError.message)

        // Update local state
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, fullName: data.fullName, role: data.role } : user,
          ),
        )

        toast({
          title: "User updated",
          description: "User information has been successfully updated.",
        })
      } else {
        // Create new user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          email_confirm: true,
          user_metadata: { full_name: data.fullName },
        })

        if (authError) throw new Error(authError.message)

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            full_name: data.fullName,
            role: data.role,
          })

          if (profileError) throw new Error(profileError.message)

          // Add to local state
          setUsers([
            ...users,
            {
              id: authData.user.id,
              email: authData.user.email || "",
              fullName: data.fullName,
              role: data.role,
              status: "active",
              subscription: "free",
              createdAt: new Date().toISOString(),
            },
          ])

          toast({
            title: "User created",
            description: "New user has been successfully created.",
          })
        }
      }

      setIsUserDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: `Failed to save user: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Button onClick={handleAddUser} className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 shadow dark:bg-blue-900">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Users</div>
            <div className="mt-1 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 shadow dark:bg-purple-900">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-300">Admin Users</div>
            <div className="mt-1 text-2xl font-bold">{stats.admins}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900">
            <div className="text-sm font-medium text-green-600 dark:text-green-300">Premium Users</div>
            <div className="mt-1 text-2xl font-bold">{stats.premium}</div>
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                        variant="outline"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                        }`}
                        variant="outline"
                      >
                        {user.role === "admin" ? (
                          <Shield className="mr-1 inline h-3 w-3" />
                        ) : (
                          <User className="mr-1 inline h-3 w-3" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.subscription === "premium"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
                        }`}
                        variant="outline"
                      >
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the user's information below." : "Enter the details to create a new user."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" disabled={isEditing} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.fullName}</span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
