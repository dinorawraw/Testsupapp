"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/admin/user-management"
import { UserProfiles } from "@/components/admin/user-profiles"
import { SubscriptionManagement } from "@/components/admin/subscription-management"
import { CalculatorCalibration } from "@/components/admin/calculator-calibration"
import { IdeaManagement } from "@/components/admin/idea-management"
import { BlogManagement } from "@/components/admin/blog-management"
import { ConsultationManagement } from "@/components/admin/consultation-management"
import { SavedCalculationsManager } from "@/components/admin/saved-calculations-manager"

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="calculations">Calculations</TabsTrigger>
        <TabsTrigger value="calibration">Calculator Settings</TabsTrigger>
        <TabsTrigger value="ideas">Ideas</TabsTrigger>
        <TabsTrigger value="blog">Blog</TabsTrigger>
        <TabsTrigger value="consultations">Consultations</TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="space-y-4">
        <UserManagement />
      </TabsContent>
      <TabsContent value="roles" className="space-y-4">
        <UserProfiles />
      </TabsContent>
      <TabsContent value="subscriptions" className="space-y-4">
        <SubscriptionManagement />
      </TabsContent>
      <TabsContent value="calculations" className="space-y-4">
        <SavedCalculationsManager />
      </TabsContent>
      <TabsContent value="calibration" className="space-y-4">
        <CalculatorCalibration />
      </TabsContent>
      <TabsContent value="ideas" className="space-y-4">
        <IdeaManagement />
      </TabsContent>
      <TabsContent value="blog" className="space-y-4">
        <BlogManagement />
      </TabsContent>
      <TabsContent value="consultations" className="space-y-4">
        <ConsultationManagement />
      </TabsContent>
    </Tabs>
  )
}
