"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, digite um endereço de e-mail válido.",
  }),
})

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // This would be replaced with your actual password reset logic
      console.log("Redefinir senha para:", values.email)

      // Simulate successful email sending
      setTimeout(() => {
        setEmailSent(true)
        toast({
          title: "E-mail enviado",
          description: "Verifique seu e-mail para obter um link de redefinição de senha.",
        })
      }, 1000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {emailSent ? (
        <div className="flex flex-col space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Enviamos um link de redefinição de senha para o seu endereço de e-mail. Por favor, verifique sua caixa de
            entrada.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              form.reset()
              setEmailSent(false)
            }}
          >
            Enviar novamente
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="nome@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
