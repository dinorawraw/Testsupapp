import { Calculator, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function BasicTools() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Calculadoras</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Calculadora de Publis</CardTitle>
            <Calculator className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white mb-4">Calcule ganhos para seu conteúdo nas redes sociais</div>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/calculators/tiktok">
                <Button variant="outline" className="w-full flex items-center gap-2 text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.321 5.562a5.122 5.122 0 0 1-3.414-1.267 5.133 5.133 0 0 1-1.635-3.257h-3.497v13.225c0 1.387-1.12 2.506-2.506 2.506a2.506 2.506 0 0 1-2.504-2.506 2.506 2.506 0 0 1 2.504-2.506c.241 0 .474.037.696.101v-3.518a6.071 6.071 0 0 0-.696-.038c-3.344 0-6.064 2.721-6.064 6.064 0 3.344 2.721 6.064 6.064 6.064 3.344 0 6.064-2.721 6.064-6.064V8.744a8.646 8.646 0 0 0 4.988 1.564V6.779c0 .001 0 .001 0 0z" />
                  </svg>
                  TikTok
                </Button>
              </Link>
              <Link href="/calculators/youtube">
                <Button variant="outline" className="w-full flex items-center gap-2 text-white">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Button>
              </Link>
              <Link href="/calculators/instagram">
                <Button variant="outline" className="w-full flex items-center gap-2 text-white">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
