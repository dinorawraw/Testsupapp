"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardLogout } from "./dashboard-logout"

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === "/dashboard" ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/calculators/instagram"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === "/calculators/instagram" ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  Calculadora Instagram
                </Link>
                <Link
                  href="/calculators/tiktok"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === "/calculators/tiktok" ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  Calculadora TikTok
                </Link>
                <Link
                  href="/calculators/youtube"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    pathname === "/calculators/youtube" ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  Calculadora YouTube
                </Link>
              </nav>
              <div className="mt-auto">
                <DashboardLogout>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
                    <LogOut className="h-5 w-5" />
                    <span>Sair</span>
                  </div>
                </DashboardLogout>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block">DinoRaw</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              } transition-colors hover:text-foreground`}
            >
              Dashboard
            </Link>
            <Link
              href="/calculators/instagram"
              className={`text-sm font-medium ${
                pathname === "/calculators/instagram" ? "text-foreground" : "text-foreground/60"
              } transition-colors hover:text-foreground`}
            >
              Calculadora Instagram
            </Link>
            <Link
              href="/calculators/tiktok"
              className={`text-sm font-medium ${
                pathname === "/calculators/tiktok" ? "text-foreground" : "text-foreground/60"
              } transition-colors hover:text-foreground`}
            >
              Calculadora TikTok
            </Link>
            <Link
              href="/calculators/youtube"
              className={`text-sm font-medium ${
                pathname === "/calculators/youtube" ? "text-foreground" : "text-foreground/60"
              } transition-colors hover:text-foreground`}
            >
              Calculadora YouTube
            </Link>
          </nav>
        </div>
        <div className="hidden md:block">
          <DashboardLogout>
            <Button variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </DashboardLogout>
        </div>
      </div>
    </header>
  )
}
