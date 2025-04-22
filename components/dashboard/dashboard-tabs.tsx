"use client"

import { useState } from "react"
import { FileText, Settings } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicTools } from "@/components/dashboard/tools/basic-tools"
import { AdvancedTools } from "@/components/dashboard/tools/advanced-tools"
import { UserSettings } from "@/components/dashboard/user-settings"
// Adicionar o import do SubscriberSpace
import { SubscriberSpace } from "@/components/dashboard/subscriber-space"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("tools")

  return (
    <Tabs defaultValue="tools" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="tools" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Ferramentas</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Conta</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tools" className="space-y-4">
        <BasicTools />
        <AdvancedTools />
        <SubscriberSpace />
      </TabsContent>
      <TabsContent value="settings" className="space-y-4">
        <UserSettings />
      </TabsContent>
    </Tabs>
  )
}
