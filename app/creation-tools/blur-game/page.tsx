"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Home, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

export default function BlurGamePage() {
  const [blurAmount, setBlurAmount] = useState(10)
  const [imageUrl, setImageUrl] = useState("/placeholder.svg?height=400&width=600")
  const [isRevealing, setIsRevealing] = useState(false)
  const [score, setScore] = useState(0)

  const handleBlurChange = (value: number[]) => {
    setBlurAmount(value[0])
  }

  const handleReveal = () => {
    setIsRevealing(true)
    // Calcular pontuação com base no nível de desfoque
    // Quanto menor o desfoque ao revelar, maior a pontuação
    const newScore = Math.round(100 - blurAmount * 10)
    setScore((prevScore) => prevScore + newScore)

    // Revelar completamente a imagem
    setBlurAmount(0)
  }

  const handleNextImage = () => {
    // Em uma aplicação real, você carregaria uma nova imagem aleatória
    setImageUrl(`/placeholder.svg?height=400&width=600&random=${Math.random()}`)
    setBlurAmount(10)
    setIsRevealing(false)
  }

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
        <div className="text-white font-bold">Pontuação: {score}</div>
      </div>

      <Card className="mb-8 card-gradient">
        <CardHeader className="border-b gradient-border">
          <CardTitle className="text-2xl text-white">Blur Game</CardTitle>
          <CardDescription className="text-white">
            Tente adivinhar a imagem com o menor desfoque possível
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center">
          <div
            className="w-full h-[400px] rounded-lg overflow-hidden mb-6 relative"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${blurAmount}px)`,
              transition: "filter 0.3s ease",
            }}
          />

          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between text-white">
              <span>Mais Desfocado</span>
              <span>Menos Desfocado</span>
            </div>
            <Slider
              defaultValue={[10]}
              max={10}
              min={1}
              step={0.5}
              value={[blurAmount]}
              onValueChange={handleBlurChange}
              disabled={isRevealing}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {!isRevealing ? (
            <Button onClick={handleReveal} className="text-white">
              Revelar Imagem
            </Button>
          ) : (
            <Button onClick={handleNextImage} className="text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Próxima Imagem
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="text-white">Como Jogar</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2 text-white">
            <li>Uma imagem desfocada será exibida na tela.</li>
            <li>Ajuste o nível de desfoque usando o controle deslizante.</li>
            <li>Tente adivinhar o que está na imagem com o maior desfoque possível.</li>
            <li>Quando estiver pronto, clique em "Revelar Imagem".</li>
            <li>Quanto menos desfocada estiver a imagem quando você revelar, mais pontos você ganha!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
