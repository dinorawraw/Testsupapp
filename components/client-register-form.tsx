"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Por favor, digite um endereço de e-mail válido.",
    }),
    password: z.string().min(8, {
      message: "Senha deve ter pelo menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Senha deve ter pelo menos 8 caracteres.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

interface ClientRegisterFormProps {
  plan?: string
}

export function ClientRegisterForm({ plan = "free" }: ClientRegisterFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Registrar com Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          },
        },
      })

      if (error) {
        throw error
      }

      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: values.name,
            role: "user",
          },
        ])

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError)
        }
      }

      toast({
        title: "Conta criada",
        description: "Você criou sua conta com sucesso.",
      })

      // Se premium plan, redirect to payment page
      if (plan === "premium") {
        router.push("/payment")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Erro de registro:", error)
      toast({
        title: "Erro de registro",
        description: error.message || "Falha ao criar conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSocialSignup(provider: "google") {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${plan}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Erro de registro social:", error)
      toast({
        title: "Erro de registro",
        description: error.message || `Falha ao registrar com ${provider}.`,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="nome@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
        </div>
      </div>
      <div className="grid gap-2">
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleSocialSignup("google")}>
          <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
            <path
              fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            />
          </svg>
          Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-400">
          Faça login
        </Link>
      </div>
    </div>
  )
}
