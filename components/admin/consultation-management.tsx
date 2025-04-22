"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  PaperclipIcon,
  FileText,
  Calendar,
  Search,
  Filter,
  User,
  CheckCircle,
  Clock,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
}

// Dados de exemplo para as consultorias
const mockConsultations: Consultation[] = [
  {
    id: "1",
    title: "Estratégia de Conteúdo para Instagram",
    status: "active",
    lastMessage: "Vamos analisar seus insights e propor uma estratégia personalizada.",
    lastMessageTime: "2023-06-28T14:30:00",
    unreadCount: 0,
    user: {
      id: "user1",
      name: "João Silva",
      email: "joao@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
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
        isRead: true,
      },
    ],
  },
  {
    id: "2",
    title: "Consultoria de Monetização de Canal",
    status: "scheduled",
    scheduledDate: "2023-07-05T15:00:00",
    unreadCount: 1,
    user: {
      id: "user2",
      name: "Maria Oliveira",
      email: "maria@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
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
        isRead: false,
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
    user: {
      id: "user3",
      name: "Pedro Santos",
      email: "pedro@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
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

export function ConsultationManagement() {
  const { toast } = useToast()
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations)
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "scheduled" | "completed">("all")
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

  // Filtrar consultorias
  const filteredConsultations = consultations.filter((consultation) => {
    // Filtrar por status
    if (statusFilter !== "all" && consultation.status !== statusFilter) {
      return false
    }

    // Filtrar por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        consultation.title.toLowerCase().includes(query) ||
        consultation.user.name.toLowerCase().includes(query) ||
        consultation.user.email.toLowerCase().includes(query)
      )
    }

    return true
  })

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
        sender: "admin",
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

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      })
    }
  }

  // Marcar consultoria como concluída
  const markAsCompleted = () => {
    if (activeConsultation) {
      const updatedConsultation = {
        ...activeConsultation,
        status: "completed" as const,
      }

      // Atualizar a lista de consultorias
      setConsultations((prev) =>
        prev.map((consultation) => (consultation.id === activeConsultation.id ? updatedConsultation : consultation)),
      )

      // Atualizar a consultoria ativa
      setActiveConsultation(updatedConsultation)

      toast({
        title: "Consultoria concluída",
        description: "A consultoria foi marcada como concluída.",
      })
    }
  }

  // Abrir o seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click()
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

  // Contar consultorias não lidas
  const unreadCount = consultations.reduce((count, consultation) => count + consultation.unreadCount, 0)

  return (
    <Card className="h-[calc(100vh-200px)] min-h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Consultorias</CardTitle>
            <CardDescription>Gerencie as consultorias personalizadas dos usuários</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} {unreadCount === 1 ? "nova mensagem" : "novas mensagens"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
          {/* Lista de consultorias */}
          <div className="md:col-span-1 border-r h-full flex flex-col">
            <div className="p-3 border-b">
              <div className="flex gap-2 mb-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar consultorias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="scheduled">Agendadas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {filteredConsultations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Nenhuma consultoria encontrada.</div>
              ) : (
                filteredConsultations.map((consultation) => (
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
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={consultation.user.avatar} alt={consultation.user.name} />
                        <AvatarFallback>{consultation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{consultation.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge
                        variant={
                          consultation.status === "active"
                            ? "default"
                            : consultation.status === "scheduled"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] px-1 py-0"
                      >
                        {consultation.status === "active"
                          ? "Ativa"
                          : consultation.status === "scheduled"
                            ? "Agendada"
                            : "Concluída"}
                      </Badge>
                      {consultation.scheduledDate && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(consultation.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                      {consultation.lastMessageTime && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDateTime(consultation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área de chat */}
          <div className="md:col-span-2 h-full flex flex-col">
            {activeConsultation ? (
              <>
                <div className="p-3 bg-muted border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">{activeConsultation.title}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        {activeConsultation.user.name} ({activeConsultation.user.email})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {activeConsultation.status !== "completed" && (
                      <Button variant="outline" size="sm" onClick={markAsCompleted}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Concluída
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {activeConsultation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "user" && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={activeConsultation.user.avatar} alt={activeConsultation.user.name} />
                          <AvatarFallback>{activeConsultation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"
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
                            message.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatDateTime(message.timestamp)}
                          {message.sender === "admin" && <span className="ml-2">{message.isRead ? "✓✓" : "✓"}</span>}
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
                  Selecione uma consultoria na lista à esquerda para visualizar e responder.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
