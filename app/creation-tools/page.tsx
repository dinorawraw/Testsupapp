"use client"

import Link from "next/link"
import { ArrowLeft, Home, Wand2, Image, Palette, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreationToolsPage() {
  const tools = [
    {
      id: "blur-game",
      title: "Blur Game",
      description: "Tente adivinhar a imagem com o menor desfoque possível",
      icon: Image,
      color: "bg-pink-500",
    },
    {
      id: "color-palette",
      title: "Paleta de Cores",
      description: "Crie paletas de cores harmoniosas para seus projetos",
      icon: Palette,
      color: "bg-blue-500",
      comingSoon: true,
    },
    {
      id: "layer-editor",
      title: "Editor de Camadas",
      description: "Edite imagens com camadas e efeitos",
      icon: Layers,
      color: "bg-purple-500",
      comingSoon: true,
    },
  ]

  return (
    <div className="container max-w-4xl py-10">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-white">
              <Home className="mr-2 h-4 w-4" /> Início
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          Ferramentas de Criação
        </h1>
        <p className="text-white/80 mt-2">Ferramentas gratuitas para ajudar na criação e edição de conteúdo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            <div className={`h-2 ${tool.color}`} />
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white flex items-center gap-2">
                  <tool.icon className="h-5 w-5" />
                  {tool.title}
                </CardTitle>
                {tool.comingSoon && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-white">Em breve</span>
                )}
              </div>
              <CardDescription className="text-white">{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              {tool.comingSoon ? (
                <Button variant="outline" disabled className="w-full text-white">
                  Em breve
                </Button>
              ) : (
                <Link href={`/creation-tools/${tool.id}`} className="w-full">
                  <Button className="w-full text-white">Acessar</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
