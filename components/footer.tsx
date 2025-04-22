"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Footer() {
  const router = useRouter()
  const [language, setLanguage] = useState("pt-BR")

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    // Em uma aplicação real, você salvaria a preferência de idioma
    // e recarregaria a página com o novo idioma
    console.log(`Idioma alterado para: ${lang}`)
  }

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DinoRaw. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Link href="/termos" className="text-sm text-muted-foreground hover:underline">
              Termos
            </Link>
            <Link href="/privacidade" className="text-sm text-muted-foreground hover:underline">
              Privacidade
            </Link>
            <Link href="/contato" className="text-sm text-muted-foreground hover:underline">
              Contato
            </Link>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                {language === "pt-BR" ? "Português" : "English"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("pt-BR")}>Português (Brasil)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  )
}
