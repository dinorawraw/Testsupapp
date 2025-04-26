"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export function UserProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const supabase = createClientComponentClient()

  // Load user profiles
  useEffect(() => {
    async function loadProfiles() {
      try {
        setLoading(true)
        setError(null)

        // Get profiles with user information
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .order("created_at", { ascending: false })

        if (profilesError) throw new Error(profilesError.message)

        // Get emails from auth.users
        if (profilesData) {
          const profilesWithEmail = await Promise.all(
            profilesData.map(async (profile) => {
              const { data: userData, error: userError } = await supabase
                .from("auth.users")
                .select("email")
                .eq("id", profile.id)
                .single()

              // If we can't get the email, use a placeholder
              const email = userError ? "Email não disponível" : userData?.email || "Email não disponível"

              return {
                ...profile,
                email,
              }
            }),
          )

          setProfiles(profilesWithEmail)
        }
      } catch (error: any) {
        console.error("Error loading profiles:", error)
        setError("Error loading user profiles. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [supabase])

  // Promote user to admin
  const promoteToAdmin = async (userId: string) => {
    try {
      setActionLoading(userId)
      setError(null)
      setSuccessMessage(null)

      const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId)

      if (error) throw new Error(error.message)

      // Update profiles list
      setProfiles(profiles.map((profile) => (profile.id === userId ? { ...profile, role: "admin" } : profile)))

      setSuccessMessage("User promoted to admin successfully!")
    } catch (error: any) {
      console.error("Error promoting user:", error)
      setError("Error promoting user. Please try again later.")
    } finally {
      setActionLoading(null)
    }
  }

  // Demote admin to regular user
  const demoteToUser = async (userId: string) => {
    try {
      setActionLoading(userId)
      setError(null)
      setSuccessMessage(null)

      const { error } = await supabase.from("profiles").update({ role: "user" }).eq("id", userId)

      if (error) throw new Error(error.message)

      // Update profiles list
      setProfiles(profiles.map((profile) => (profile.id === userId ? { ...profile, role: "user" } : profile)))

      setSuccessMessage("Admin demoted to regular user successfully!")
    } catch (error: any) {
      console.error("Error demoting admin:", error)
      setError("Error demoting admin. Please try again later.")
    } finally {
      setActionLoading(null)
    }
  }

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading user profiles...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No user profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                        {profile.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {profile.role === "admin" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => demoteToUser(profile.id)}
                          disabled={actionLoading === profile.id || profile.email === "contato@dinoraw.com.br"}
                        >
                          {actionLoading === profile.id ? "Processing..." : "Demote"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promoteToAdmin(profile.id)}
                          disabled={actionLoading === profile.id}
                        >
                          {actionLoading === profile.id ? "Processing..." : "Promote"}
                        </Button>
                      )}
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
