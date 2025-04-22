"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Calculator, Instagram, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

// Esquema para a calculadora do TikTok
const tiktokSchema = z.object({
  followerRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  viewsRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  likesRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  commentsRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  highValueFactor: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  lowValueFactor: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  discountPercentage: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
})

// Esquema para a calculadora do Instagram
const instagramSchema = z.object({
  smallScopeRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  largeScopeRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  minReachRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  maxReachRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  licenseBaseRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  reelsMultiplier: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  discountPercentage: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
})

// Esquema para a calculadora do YouTube
const youtubeSchema = z.object({
  subscriberRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  viewRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  minuteRate: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  engagementMultiplier: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
  discountPercentage: z.string().regex(/^\d*\.?\d+$/, {
    message: "Digite um número válido",
  }),
})

export function CalculatorCalibration() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("tiktok")
  const [isLoading, setIsLoading] = useState(false)

  // Formulário para TikTok
  const tiktokForm = useForm<z.infer<typeof tiktokSchema>>({
    resolver: zodResolver(tiktokSchema),
    defaultValues: {
      followerRate: "0.004",
      viewsRate: "0.004",
      likesRate: "0.008",
      commentsRate: "0.08",
      highValueFactor: "0.4",
      lowValueFactor: "0.24",
      discountPercentage: "10",
    },
  })

  // Formulário para Instagram
  const instagramForm = useForm<z.infer<typeof instagramSchema>>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      smallScopeRate: "0.014",
      largeScopeRate: "0.008",
      minReachRate: "8",
      maxReachRate: "10",
      licenseBaseRate: "13.32",
      reelsMultiplier: "2",
      discountPercentage: "10",
    },
  })

  // Formulário para YouTube
  const youtubeForm = useForm<z.infer<typeof youtubeSchema>>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      subscriberRate: "0.005",
      viewRate: "0.003",
      minuteRate: "0.2",
      engagementMultiplier: "1.5",
      discountPercentage: "10",
    },
  })

  // Função para salvar configurações do TikTok
  function onTiktokSubmit(values: z.infer<typeof tiktokSchema>) {
    setIsLoading(true)

    // Aqui você enviaria os valores para sua API
    console.log("Configurações do TikTok:", values)

    // Simulando uma chamada de API
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da calculadora do TikTok foram atualizadas com sucesso.",
      })
      setIsLoading(false)
    }, 1000)
  }

  // Função para salvar configurações do Instagram
  function onInstagramSubmit(values: z.infer<typeof instagramSchema>) {
    setIsLoading(true)

    // Aqui você enviaria os valores para sua API
    console.log("Configurações do Instagram:", values)

    // Simulando uma chamada de API
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da calculadora do Instagram foram atualizadas com sucesso.",
      })
      setIsLoading(false)
    }, 1000)
  }

  // Função para salvar configurações do YouTube
  function onYoutubeSubmit(values: z.infer<typeof youtubeSchema>) {
    setIsLoading(true)

    // Aqui você enviaria os valores para sua API
    console.log("Configurações do YouTube:", values)

    // Simulando uma chamada de API
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da calculadora do YouTube foram atualizadas com sucesso.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calibração de Calculadoras</CardTitle>
        <CardDescription>
          Configure os parâmetros utilizados nas calculadoras para ajustar os valores gerados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tiktok" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.321 5.562a5.122 5.122 0 0 1-3.414-1.267 5.133 5.133 0 0 1-1.635-3.257h-3.497v13.225c0 1.387-1.12 2.506-2.506 2.506a2.506 2.506 0 0 1-2.504-2.506 2.506 2.506 0 0 1 2.504-2.506c.241 0 .474.037.696.101v-3.518a6.071 6.071 0 0 0-.696-.038c-3.344 0-6.064 2.721-6.064 6.064 0 3.344 2.721 6.064 6.064 6.064 3.344 0 6.064-2.721 6.064-6.064V8.744a8.646 8.646 0 0 0 4.988 1.564V6.779c0 .001 0 .001 0 0z" />
              </svg>
              <span>TikTok</span>
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              <span>YouTube</span>
            </TabsTrigger>
          </TabsList>

          {/* Formulário do TikTok */}
          <TabsContent value="tiktok">
            <Form {...tiktokForm}>
              <form onSubmit={tiktokForm.handleSubmit(onTiktokSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={tiktokForm.control}
                    name="followerRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Seguidor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de seguidores</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="viewsRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Visualização</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de visualizações</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="likesRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Curtida</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de curtidas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="commentsRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Comentário</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de comentários</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="highValueFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fator de Valor Alto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Multiplicador para valores acima do limite</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="lowValueFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fator de Valor Baixo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Multiplicador para valores abaixo do limite</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tiktokForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentagem de Desconto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Desconto aplicado quando solicitado (%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mt-4" disabled={isLoading}>
                  {isLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Formulário do Instagram */}
          <TabsContent value="instagram">
            <Form {...instagramForm}>
              <form onSubmit={instagramForm.handleSubmit(onInstagramSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={instagramForm.control}
                    name="smallScopeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa para Escopo Pequeno</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de seguidores (escopo pequeno)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="largeScopeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa para Escopo Grande</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de seguidores (escopo grande)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="minReachRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa para Alcance Mínimo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo alcance mínimo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="maxReachRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa para Alcance Máximo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo alcance máximo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="licenseBaseRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa Base de Licenciamento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor base para cálculo de licenciamento</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="reelsMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Multiplicador para Reels</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Multiplicador aplicado para calcular o valor de Reels</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={instagramForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentagem de Desconto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Desconto aplicado quando solicitado (%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mt-4" disabled={isLoading}>
                  {isLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Formulário do YouTube */}
          <TabsContent value="youtube">
            <Form {...youtubeForm}>
              <form onSubmit={youtubeForm.handleSubmit(onYoutubeSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={youtubeForm.control}
                    name="subscriberRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Inscrito</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de inscritos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={youtubeForm.control}
                    name="viewRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Visualização</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pelo número de visualizações</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={youtubeForm.control}
                    name="minuteRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa por Minuto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Valor multiplicado pela duração do vídeo em minutos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={youtubeForm.control}
                    name="engagementMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Multiplicador de Engajamento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Multiplicador baseado na taxa de engajamento</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={youtubeForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentagem de Desconto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Desconto aplicado quando solicitado (%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mt-4" disabled={isLoading}>
                  {isLoading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <Calculator className="inline-block mr-1 h-4 w-4" />
          As alterações serão aplicadas imediatamente a todos os novos cálculos.
        </div>
      </CardFooter>
    </Card>
  )
}
