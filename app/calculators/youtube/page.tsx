import { YoutubeCalculator } from "@/components/calculators/youtube-calculator"

export default function YoutubePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Calculadora de Valor do YouTube</h1>
      <p className="text-gray-600 mb-8">
        Descubra o valor estimado do seu canal do YouTube com base em métricas importantes como número de inscritos,
        visualizações e taxa de engajamento.
      </p>

      <YoutubeCalculator />
    </div>
  )
}
