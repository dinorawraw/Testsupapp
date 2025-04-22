import type React from "react"
import { LucideCreditCard } from "lucide-react"

export function CreditCard(props: React.ComponentProps<typeof LucideCreditCard>) {
  return <LucideCreditCard {...props} />
}
