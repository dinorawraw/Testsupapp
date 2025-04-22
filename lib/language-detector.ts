"use client"

import { useEffect, useState } from "react"

type Language = "en" | "pt-BR"

export function useLanguageDetector() {
  const [language, setLanguage] = useState<Language>("en")
  const [country, setCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function detectLocation() {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()

        setCountry(data.country_code)

        // Default to English, even for Brazil (as per requirement)
        setLanguage("en")

        setLoading(false)
      } catch (error) {
        console.error("Error detecting location:", error)
        // Default to English if there's an error
        setLanguage("en")
        setLoading(false)
      }
    }

    detectLocation()
  }, [])

  return { language, country, loading }
}
