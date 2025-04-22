"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, digite um endereço de e-mail válido.",
  }),
})

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
})

export function UserSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
    },
  })

  // Notifications form
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
    },
  })

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsLoading(true)

    // This would be replaced with your actual profile update logic
    setTimeout(() => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas.",
      })
      setIsLoading(false)
    }, 1000)
  }

  function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    setIsLoading(true)

    // This would be replaced with your actual notification settings update logic
    setTimeout(() => {
      toast({
        title: "Configurações de notificação atualizadas",
        description: "Suas preferências de notificação foram salvas.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Perfil</CardTitle>
          <CardDescription className="text-white">Gerencie suas informações de conta</CardDescription>
        </CardHeader>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">E-mail</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="text-white">
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Notificações</CardTitle>
          <CardDescription className="text-white">Gerencie suas preferências de notificação</CardDescription>
        </CardHeader>
        <Form {...notificationsForm}>
          <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={notificationsForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Notificações por E-mail</FormLabel>
                      <FormDescription className="text-white">
                        Receber notificações sobre atividades da conta
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">E-mails de Marketing</FormLabel>
                      <FormDescription className="text-white">
                        Receber e-mails sobre novos recursos e ofertas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="text-white">
                {isLoading ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Segurança</CardTitle>
          <CardDescription className="text-white">Gerencie as configurações de segurança da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Senha</h3>
            <p className="text-xs text-white/90">Altere sua senha para manter sua conta segura</p>
            <Button variant="outline" className="text-white">
              Alterar Senha
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Autenticação de Dois Fatores</h3>
            <p className="text-xs text-white/90">Adicione uma camada extra de segurança à sua conta</p>
            <Button variant="outline" className="text-white">
              Ativar 2FA
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Sessões Ativas</h3>
            <p className="text-xs text-white/90">Gerencie dispositivos onde você está conectado atualmente</p>
            <Button variant="outline" className="text-white">
              Gerenciar Sessões
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription className="text-white">Ações irreversíveis da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Excluir Conta</h3>
            <p className="text-xs text-white/90">Exclua permanentemente sua conta e todos os dados associados</p>
            <Button variant="destructive">Excluir Conta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
