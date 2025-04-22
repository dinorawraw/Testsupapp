import { Card, CardContent } from "@/components/ui/card"

export default function PaymentSuccessLoading() {
  return (
    <div className="container max-w-lg py-10">
      <Card className="card-gradient">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium text-white">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
