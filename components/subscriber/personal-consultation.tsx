"use client"

import { useState, useRef, useEffect } from "react"
import { Send, PaperclipIcon, MessageSquare, Calendar, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Tipo para as mensagens
interface Message {
  id: string
  content: string
  sender: "user" | "admin"
  timestamp: string
  attachments?: {
    type: "image" | "document"
    url: string
    name: string
  }[]
  isRead: boolean
}

// Tipo para as consultorias
interface Consultation {
  id: string
  title: string
  status: "active" | "scheduled" | "completed"
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  messages: Message[]
  scheduledDate?: string
}

// Dados de exemplo para as consultorias
const mockConsultations: Consultation[] = [
  {
    id: "1",
    title: "Estratégia de Conteúdo para Instagram",
    status: "active",
    lastMessage: "Vamos analisar seus insights e propor uma estratégia personalizada.",
    lastMessageTime: "2023-06-28T14:30:00",
    unreadCount: 2,
    messages: [
      {
        id: "1",
        content:
          "Olá! Gostaria de ajuda para desenvolver uma estratégia de conteúdo para o Instagram. Estou tendo dificuldades para aumentar meu engajamento.",
        sender: "user",
        timestamp: "2023-06-28T10:15:00",
        isRead: true,
      },
      {
        id: "2",
        content:
          "Olá! Claro, posso ajudar com isso. Poderia me contar um pouco mais sobre seu perfil? Qual é o seu nicho e público-alvo?",
        sender: "admin",
        timestamp: "2023-06-28T10:30:00",
        isRead: true,
      },
      {
        id: "3",
        content:
          "Meu perfil é focado em moda sustentável. Meu público-alvo são mulheres entre 25-35 anos interessadas em consumo consciente. Tenho cerca de 5.000 seguidores, mas o engajamento está baixo ultimamente.",
        sender: "user",
        timestamp: "2023-06-28T11:00:00",
        isRead: true,
      },
      {
        id: "4",
        content:
          "Entendi! Vou analisar seu perfil e preparar algumas recomendações. Você poderia compartilhar seus insights do Instagram para que eu possa ver os dados de desempenho?",
        sender: "admin",
        timestamp: "2023-06-28T11:15:00",
        isRead: true,
      },
      {
        id: "5",
        content: "Claro! Aqui estão os insights dos últimos 30 dias.",
        sender: "user",
        timestamp: "2023-06-28T11:30:00",
        attachments: [
          {
            type: "image",
            url: "/placeholder.svg?height=300&width=400",
            name: "insights-instagram.jpg",
          },
        ],
        isRead: true,
      },
      {
        id: "6",
        content:
          "Obrigado pelos insights! Analisando os dados, percebo que seus Reels têm um desempenho significativamente melhor que as fotos estáticas. Vamos focar em aumentar a frequência desse formato.",
        sender: "admin",
        timestamp: "2023-06-28T14:00:00",
        isRead: true,
      },
      {
        id: "7",
        content: "Vamos analisar seus insights e propor uma estratégia personalizada.",
        sender: "admin",
        timestamp: "2023-06-28T14:30:00",
        attachments: [
          {
            type: "document",
            url: "#",
            name: "estrategia-instagram.pdf",
          },
        ],
        isRead: false,
      },
    ],
  },
  {
    id: "2",
    title: "Consultoria de Monetização de Canal",
    status: "scheduled",
    scheduledDate: "2023-07-05T15:00:00",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content:
          "Olá! Gostaria de agendar uma consultoria para discutir estratégias de monetização para meu canal do YouTube.",
        sender: "user",
        timestamp: "2023-06-25T09:00:00",
        isRead: true,
      },
      {
        id: "2",
        content: "Olá! Ficarei feliz em ajudar. Podemos agendar para a próxima semana. Que tal dia 5 de julho às 15h?",
        sender: "admin",
        timestamp: "2023-06-25T09:30:00",
        isRead: true,
      },
      {
        id: "3",
        content: "Perfeito! Fica agendado então. Obrigado!",
        sender: "user",
        timestamp: "2023-06-25T10:00:00",
        isRead: true,
      },
    ],
  },
  {
    id: "3",
    title: "Análise de Performance de TikTok",
    status: "completed",
    lastMessage: "Espero que as recomendações tenham sido úteis. Qualquer dúvida, estou à disposição!",
    lastMessageTime: "2023-06-20T16:45:00",
    unreadCount: 0,
    messages: [
      {
        id: "1",
        content: "Preciso de ajuda para entender por que meus vídeos no TikTok não estão performando bem.",
        sender: "user",
        timestamp: "2023-06-18T13:00:00",
        isRead: true,
      },
      {
        id: "2",
        content: "Olá! Vamos analisar juntos. Poderia compartilhar alguns exemplos dos seus vídeos recentes?",
        sender: "admin",
        timestamp: "2023-06-18T13:15:00",
        isRead: true,
      },
      {
        id: "3",
        content: "Claro, aqui estão os links dos meus últimos 5 vídeos.",
        sender: "user",
        timestamp: "2023-06-18T13:30:00",
        isRead: true,
      },
      {
        id: "4",
        content:
          "Obrigado! Analisei seus vídeos e identifiquei alguns pontos que podem ser melhorados. Preparei um documento com recomendações detalhadas.",
        sender: "admin",
        timestamp: "2023-06-20T16:30:00",
        attachments: [
          {
            type: "document",
            url: "#",
            name: "analise-tiktok.pdf",
          },
        ],
        isRead: true,
      },
      {
        id: "5",
        content: "Espero que as recomendações tenham sido úteis. Qualquer dúvida, estou à disposição!",
        sender: "admin",
        timestamp: "2023-06-20T16:45:00",
        isRead: true,
      },
    ],
  },
]

export function PersonalConsultation() {
  const { toast } = useToast()
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations)
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false)
  const [schedulingTopic, setSchedulingTopic] = useState("")
  const [schedulingDate, setSchedulingDate] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Rolar para a última mensagem quando a conversa ativa muda ou novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConsultation])

  // Marcar mensagens como lidas quando a conversa é aberta
  useEffect(() => {
    if (activeConsultation) {
      setConsultations((prev) =>
        prev.map((consultation) =>
          consultation.id === activeConsultation.id
            ? {
                ...consultation,
                unreadCount: 0,
                messages: consultation.messages.map((message) => ({
                  ...message,
                  isRead: true,
                })),
              }
            : consultation,
        ),
      )
    }
  }, [activeConsultation])

  // Selecionar uma consultoria
  const selectConsultation = (consultation: Consultation) => {
    setActiveConsultation(consultation)
  }

  // Enviar uma nova mensagem
  const sendMessage = () => {
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return

    if (activeConsultation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: "user",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      // Adicionar anexos se houver
      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0]
        const isImage = file.type.startsWith("image/")

        newMsg.attachments = [
          {
            type: isImage ? "image" : "document",
            url: URL.createObjectURL(file),
            name: file.name,
          },
        ]
      }

      // Atualizar a consultoria ativa com a nova mensagem
      const updatedConsultation = {
        ...activeConsultation,
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date().toISOString(),
        messages: [...activeConsultation.messages, newMsg],
      }

      // Atualizar a lista de consultorias
      setConsultations((prev) =>
        prev.map((consultation) => (consultation.id === activeConsultation.id ? updatedConsultation : consultation)),
      )

      // Atualizar a consultoria ativa
      setActiveConsultation(updatedConsultation)

      // Limpar o campo de mensagem e o input de arquivo
      setNewMessage("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Simular resposta do administrador após 2 segundos
      setTimeout(() => {
        const adminResponse: Message = {
          id: Date.now().toString(),
          content: "Obrigado pela sua mensagem! Vou analisar e responder em breve.",
          sender: "admin",
          timestamp: new Date().toISOString(),
          isRead: true,
        }

        const updatedWithResponse = {
          ...updatedConsultation,
          lastMessage: adminResponse.content,
          lastMessageTime: adminResponse.timestamp,
          messages: [...updatedConsultation.messages, adminResponse],
        }

        setConsultations((prev) =>
          prev.map((consultation) => (consultation.id === activeConsultation.id ? updatedWithResponse : consultation)),
        )

        setActiveConsultation(updatedWithResponse)
      }, 2000)
    }
  }

  // Abrir o seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  // Agendar uma nova consultoria
  const scheduleConsultation = () => {
    if (!schedulingTopic.trim() || !schedulingDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    const newConsultation: Consultation = {
      id: Date.now().toString(),
      title: schedulingTopic,
      status: "scheduled",
      scheduledDate: new Date(schedulingDate).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: "1",
          content: `Olá! Gostaria de agendar uma consultoria sobre: ${schedulingTopic}`,
          sender: "user",
          timestamp: new Date().toISOString(),
          isRead: true,
        },
      ],
    }

    setConsultations((prev) => [newConsultation, ...prev])
    setIsSchedulingOpen(false)
    setSchedulingTopic("")
    setSchedulingDate("")

    toast({
      title: "Consultoria agendada",
      description: "Sua consultoria foi agendada com sucesso!",
    })

    // Simular resposta do administrador após 1 segundo
    setTimeout(() => {
      const adminResponse: Message = {
        id: Date.now().toString(),
        content: `Olá! Recebi seu agendamento para ${new Date(schedulingDate).toLocaleDateString("pt-BR")}. Confirmo nossa consultoria sobre "${schedulingTopic}". Estarei disponível no horário marcado.`,
        sender: "admin",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      const updatedConsultation = {
        ...newConsultation,
        unreadCount: 1,
        lastMessage: adminResponse.content,
        lastMessageTime: adminResponse.timestamp,
        messages: [...newConsultation.messages, adminResponse],
      }

      setConsultations((prev) =>
        prev.map((consultation) => (consultation.id === newConsultation.id ? updatedConsultation : consultation)),
      )
    }, 1000)
  }

  // Formatar data e hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Formatar data completa
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Consultoria Personalizada</h2>
            <p className="text-muted-foreground">Chat exclusivo para consultoria com nossos especialistas</p>
          </div>
          <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consultoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Consultoria</DialogTitle>
                <DialogDescription>Preencha os detalhes para agendar uma consultoria personalizada.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="topic" className="text-sm font-medium">
                    Tópico da Consultoria
                  </label>
                  <Input
                    id="topic"
                    placeholder="Ex: Estratégia de Conteúdo para Instagram"
                    value={schedulingTopic}
                    onChange={(e) => setSchedulingTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Data e Hora
                  </label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={schedulingDate}
                    onChange={(e) => setSchedulingDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={scheduleConsultation}>Agendar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        {/* Lista de consultorias */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 bg-muted font-medium">Minhas Consultorias</div>
          <div className="flex-grow overflow-y-auto">
            <Tabs defaultValue="active">
              <div className="px-3 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">
                    Ativas
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex-1">
                    Agendadas
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    Concluídas
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="active" className="p-0 m-0">
                {consultations.filter((c) => c.status === "active").length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Nenhuma consultoria ativa no momento.</div>
                ) : (
                  consultations
                    .filter((c) => c.status === "active")
                    .map((consultation) => (
                      <div
                        key={consultation.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          activeConsultation?.id === consultation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => selectConsultation(consultation)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{consultation.title}</div>
                          {consultation.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {consultation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {consultation.lastMessage && (
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {consultation.lastMessage}
                          </div>
                        )}
                        {consultation.lastMessageTime && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(consultation.lastMessageTime)}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </TabsContent>
              <TabsContent value="scheduled" className="p-0 m-0">
                {consultations.filter((c) => c.status === "scheduled").length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Nenhuma consultoria agendada.</div>
                ) : (
                  consultations
                    .filter((c) => c.status === "scheduled")
                    .map((consultation) => (
                      <div
                        key={consultation.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          activeConsultation?.id === consultation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => selectConsultation(consultation)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{consultation.title}</div>
                          {consultation.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {consultation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {consultation.scheduledDate && (
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatFullDate(consultation.scheduledDate)}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </TabsContent>
              <TabsContent value="completed" className="p-0 m-0">
                {consultations.filter((c) => c.status === "completed").length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Nenhuma consultoria concluída.</div>
                ) : (
                  consultations
                    .filter((c) => c.status === "completed")
                    .map((consultation) => (
                      <div
                        key={consultation.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          activeConsultation?.id === consultation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => selectConsultation(consultation)}
                      >
                        <div className="font-medium">{consultation.title}</div>
                        {consultation.lastMessage && (
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {consultation.lastMessage}
                          </div>
                        )}
                        {consultation.lastMessageTime && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(consultation.lastMessageTime)}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Área de chat */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {activeConsultation ? (
            <>
              <div className="p-3 bg-muted font-medium border-b flex justify-between items-center">
                <div>{activeConsultation.title}</div>
                <Badge
                  variant={
                    activeConsultation.status === "active"
                      ? "default"
                      : activeConsultation.status === "scheduled"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {activeConsultation.status === "active"
                    ? "Ativa"
                    : activeConsultation.status === "scheduled"
                      ? "Agendada"
                      : "Concluída"}
                </Badge>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {activeConsultation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index}>
                              {attachment.type === "image" ? (
                                <div className="mt-2">
                                  <img
                                    src={attachment.url || "/placeholder.svg"}
                                    alt={attachment.name}
                                    className="max-w-full rounded-md max-h-60 object-contain"
                                  />
                                  <div className="text-xs mt-1 opacity-70">{attachment.name}</div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-background/10 rounded-md">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm truncate">{attachment.name}</span>
                                  <Button variant="ghost" size="sm" className="ml-auto h-6 px-2">
                                    Baixar
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatDateTime(message.timestamp)}
                        {message.sender === "user" && <span className="ml-2">{message.isRead ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {activeConsultation.status !== "completed" && (
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={() => {}} />
                    <Button variant="outline" size="icon" type="button" onClick={openFileSelector}>
                      <PaperclipIcon className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-10 flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button type="button" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhuma consultoria selecionada</h3>
              <p className="text-muted-foreground mb-4">
                Selecione uma consultoria existente ou agende uma nova para começar.
              </p>
              <Button onClick={() => setIsSchedulingOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consultoria
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
