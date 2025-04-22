"use client"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RPGPortraitPage() {
  return (
    <div className="container mx-auto p-8">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" /> Início
            </Button>
          </Link>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">RPG Portrait</h1>
      <div className="bg-muted p-6 rounded-lg">
        <p className="text-lg">This page will contain the RPG Portrait application.</p>
      </div>
    </div>
  )
}
