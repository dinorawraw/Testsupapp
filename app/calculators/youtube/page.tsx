"use client"
import Link from "next/link"
import { ArrowLeft, Home, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function YouTubeCalculatorPage() {
  return (
    <div className="container max-w-4xl py-10">
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

      <Card className="mb-8 card-gradient">
        <CardHeader className="border-b gradient-border">
          <CardTitle className="text-2xl">Calculadora YouTube</CardTitle>
          <CardDescription>Calculate potential earnings for your YouTube content</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Em breve</AlertTitle>
            <AlertDescription>
              A calculadora do YouTube está em desenvolvimento e estará disponível em breve.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
