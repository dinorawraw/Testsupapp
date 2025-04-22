"use client"

import { useState } from "react"
import { Settings, Users, CreditCard, Calculator, MessageSquare, Lightbulb, FileText } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/admin/user-management"
import { SubscriptionManagement } from "@/components/admin/subscription-management"
import { PlatformSettings } from "@/components/admin/platform-settings"
import { CalculatorCalibration } from "@/components/admin/calculator-calibration"
import { IdeaManagement } from "@/components/admin/idea-management"
import { BlogManagement } from "@/components/admin/blog-management"
import { ConsultationManagement } from "@/components/admin/consultation-management"

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <Tabs defaultValue="users" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Usuários</span>
        </TabsTrigger>
        <TabsTrigger value="subscriptions" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Assinaturas</span>
        </TabsTrigger>
        <TabsTrigger value="calculators" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <span>Calculadoras</span>
        </TabsTrigger>
        <TabsTrigger value="ideas" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span>Ideias</span>
        </TabsTrigger>
        <TabsTrigger value="blog" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Blog</span>
        </TabsTrigger>
        <TabsTrigger value="consultations" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Consultorias</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="space-y-4">
        <UserManagement />
      </TabsContent>
      <TabsContent value="subscriptions" className="space-y-4">
        <SubscriptionManagement />
      </TabsContent>
      <TabsContent value="calculators" className="space-y-4">
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
      <TabsContent value="settings" className="space-y-4">
        <PlatformSettings />
      </TabsContent>
    </Tabs>
  )
}
