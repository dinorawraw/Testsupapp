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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  type Consultation,
  type ConsultationMessage,
  createMessage,
  getAllConsultations,
  getConsultationMessages,
  markMessagesAsRead,
  updateConsultation,
} from "@/lib/supabase/consultation-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EnhancedConsultation extends Consultation {
  user?: {
    email: string
    id: string
  }
  messages: ConsultationMessage[]
  unreadCount: number
}

export function ConsultationManagement() {
  const { toast } = useToast()
  const [consultations, setConsultations] = useState<EnhancedConsultation[]>([])
  const [activeConsultation, setActiveConsultation] = useState<EnhancedConsultation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "scheduled" | "completed">("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Load consultations from database
  useEffect(() => {
    async function loadConsultations() {
      try {
        setIsLoading(true)
        const consultationsData = await getAllConsultations()

        const enhancedConsultations: EnhancedConsultation[] = await Promise.all(
          consultationsData.map(async (consultation) => {
            // Get messages for each consultation
            const messages = await getConsultationMessages(consultation.id)

            // Calculate unread messages (admin view - count unread user messages)
            const unreadCount = messages.filter((m) => m.sender === "user" && !m.is_read).length

            return {
              ...consultation,
              messages,
              unreadCount,
            }
          }),
        )

        setConsultations(enhancedConsultations)
      } catch (error) {
        console.error("Error loading consultations:", error)
        toast({
          title: "Error",
          description: "Failed to load consultations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConsultations()
  }, [toast])

  // Scroll to the last message when the active conversation changes or new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConsultation])

  // Mark messages as read when the conversation is opened
  useEffect(() => {
    async function markAsRead() {
      if (activeConsultation) {
        try {
          await markMessagesAsRead(activeConsultation.id, "admin")

          setConsultations((prev) =>
            prev.map((consultation) =>
              consultation.id === activeConsultation.id
                ? {
                    ...consultation,
                    unreadCount: 0,
                    messages: consultation.messages.map((message) => ({
                      ...message,
                      is_read: message.sender === "user" ? true : message.is_read,
                    })),
                  }
                : consultation,
            ),
          )

          setActiveConsultation((prevState) => {
            if (!prevState) return null
            return {
              ...prevState,
              unreadCount: 0,
              messages: prevState.messages.map((message) => ({
                ...message,
                is_read: message.sender === "user" ? true : message.is_read,
              })),
            }
          })
        } catch (error) {
          console.error("Error marking messages as read:", error)
        }
      }
    }

    markAsRead()
  }, [activeConsultation])

  // Filter consultations
  const filteredConsultations = consultations.filter((consultation) => {
    // Filter by status
    if (statusFilter !== "all" && consultation.status !== statusFilter) {
      return false
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        consultation.title.toLowerCase().includes(query) ||
        (consultation.user?.email && consultation.user.email.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Select a consultation
  const selectConsultation = (consultation: EnhancedConsultation) => {
    setActiveConsultation(consultation)
  }

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return

    if (activeConsultation) {
      try {
        let attachments

        // Handle attachments if any
        if (fileInputRef.current?.files?.length) {
          const file = fileInputRef.current.files[0]
          const isImage = file.type.startsWith("image/")

          // In a real app, you would upload the file to storage
          // For now, we'll just create a fake URL
          attachments = [
            {
              type: isImage ? "image" : "document",
              url: "/placeholder.svg", // In a real app, this would be the uploaded file URL
              name: file.name,
            },
          ]
        }

        // Create the message in the database
        const newMsg = await createMessage({
          consultation_id: activeConsultation.id,
          content: newMessage.trim(),
          sender: "admin",
          is_read: false,
          attachments,
        })

        // Update local state
        const updatedMessages = [...activeConsultation.messages, newMsg]

        const updatedConsultation = {
          ...activeConsultation,
          messages: updatedMessages,
        }

        setConsultations((prev) =>
          prev.map((consultation) => (consultation.id === activeConsultation.id ? updatedConsultation : consultation)),
        )

        setActiveConsultation(updatedConsultation)

        // Clear the message input and file input
        setNewMessage("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso.",
        })
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem. Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    }
  }

  // Mark consultation as completed
  const markAsCompleted = async () => {
    if (activeConsultation) {
      try {
        const updatedConsultation = await updateConsultation(activeConsultation.id, {
          status: "completed",
        })

        // Update local state
        setConsultations((prev) =>
          prev.map((consultation) =>
            consultation.id === activeConsultation.id ? { ...consultation, status: "completed" } : consultation,
          ),
        )

        setActiveConsultation((prevState) => {
          if (!prevState) return null
          return { ...prevState, status: "completed" }
        })

        toast({
          title: "Consultoria concluída",
          description: "A consultoria foi marcada como concluída.",
        })
      } catch (error) {
        console.error("Error updating consultation status:", error)
        toast({
          title: "Erro",
          description: "Não foi possível marcar a consultoria como concluída.",
          variant: "destructive",
        })
      }
    }
  }

  // Open the file selector
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Format full date
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

  // Count unread consultations
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredConsultations.length === 0 ? (
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
                        <AvatarFallback>{consultation.user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{consultation.user?.email || "User"}</span>
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
                      {consultation.scheduled_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(consultation.scheduled_date).toLocaleDateString()}
                        </span>
                      )}
                      {consultation.messages.length > 0 && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDateTime(consultation.messages[consultation.messages.length - 1].timestamp)}
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
                        {activeConsultation.user?.email || "User"} ({activeConsultation.user_id})
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
                  {activeConsultation.messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      Nenhuma mensagem nesta consultoria. Envie uma mensagem para iniciar a conversa.
                    </div>
                  ) : (
                    activeConsultation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        {message.sender === "user" && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarFallback>
                              {activeConsultation.user?.email?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
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
                            {message.sender === "admin" && <span className="ml-2">{message.is_read ? "✓✓" : "✓"}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
