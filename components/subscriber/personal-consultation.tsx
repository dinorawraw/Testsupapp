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
import {
  type Consultation,
  type ConsultationMessage,
  createConsultation,
  createMessage,
  getConsultationMessages,
  getConsultationsByUserId,
  markMessagesAsRead,
} from "@/lib/supabase/consultation-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EnhancedConsultation extends Consultation {
  messages: ConsultationMessage[]
  unreadCount: number
}

export function PersonalConsultation() {
  const { toast } = useToast()
  const [consultations, setConsultations] = useState<EnhancedConsultation[]>([])
  const [activeConsultation, setActiveConsultation] = useState<EnhancedConsultation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false)
  const [schedulingTopic, setSchedulingTopic] = useState("")
  const [schedulingDate, setSchedulingDate] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()
  const userId = "your-user-id" // Replace with actual user ID

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const fetchedConsultations = await getConsultationsByUserId(supabase, userId)

        // Fetch messages and calculate unread count for each consultation
        const enhancedConsultations = await Promise.all(
          fetchedConsultations.map(async (consultation) => {
            const messages = await getConsultationMessages(supabase, consultation.id)
            const unreadCount = messages.filter((msg) => !msg.is_read && msg.sender_id !== userId).length
            return { ...consultation, messages: messages, unreadCount: unreadCount } as EnhancedConsultation
          }),
        )

        setConsultations(enhancedConsultations)
      } catch (error) {
        console.error("Error fetching consultations:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar as consultorias.",
          variant: "destructive",
        })
      }
    }

    fetchConsultations()
  }, [supabase, userId, toast])

  // Rolar para a última mensagem quando a conversa ativa muda ou novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConsultation])

  // Marcar mensagens como lidas quando a conversa é aberta
  useEffect(() => {
    const markAsRead = async () => {
      if (activeConsultation) {
        try {
          await markMessagesAsRead(supabase, activeConsultation.id, userId)

          // Update the state to reflect the changes
          setConsultations((prev) =>
            prev.map((consultation) =>
              consultation.id === activeConsultation.id
                ? {
                    ...consultation,
                    unreadCount: 0,
                    messages: consultation.messages.map((msg) => ({ ...msg, is_read: true })),
                  }
                : consultation,
            ),
          )
        } catch (error) {
          console.error("Error marking messages as read:", error)
          toast({
            title: "Erro",
            description: "Falha ao marcar mensagens como lidas.",
            variant: "destructive",
          })
        }
      }
    }

    markAsRead()
  }, [activeConsultation, supabase, userId, toast])

  // Selecionar uma consultoria
  const selectConsultation = (consultation: EnhancedConsultation) => {
    setActiveConsultation(consultation)
  }

  // Enviar uma nova mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return

    if (activeConsultation) {
      try {
        const file = fileInputRef.current?.files?.[0]
        let attachmentUrl = null
        let attachmentName = null

        if (file) {
          const isImage = file.type.startsWith("image/")
          attachmentName = file.name

          // Upload the file to Supabase storage
          const { data, error } = await supabase.storage
            .from("consultation-attachments")
            .upload(`${userId}/${activeConsultation.id}/${Date.now()}-${file.name}`, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (error) {
            throw new Error(`Failed to upload file: ${error.message}`)
          }

          attachmentUrl = data.path // Store the path, not the full URL
        }

        // Create the message in the database
        const newMsg = await createMessage(
          supabase,
          activeConsultation.id,
          userId,
          newMessage.trim(),
          attachmentUrl,
          attachmentName,
        )

        // Update the local state
        setConsultations((prev) =>
          prev.map((consultation) => {
            if (consultation.id === activeConsultation.id) {
              const updatedConsultation = {
                ...consultation,
                messages: [...consultation.messages, newMsg],
              }
              return updatedConsultation
            }
            return consultation
          }),
        )

        setActiveConsultation((prev) => {
          if (prev) {
            return {
              ...prev,
              messages: [...prev.messages, newMsg],
            }
          }
          return prev
        })

        // Clear the input field and file input
        setNewMessage("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Simulate admin response after 2 seconds
        setTimeout(async () => {
          const adminResponse = await createMessage(
            supabase,
            activeConsultation.id,
            "admin", // Assuming "admin" is a valid user ID
            "Obrigado pela sua mensagem! Vou analisar e responder em breve.",
            null,
            null,
          )

          setConsultations((prev) =>
            prev.map((consultation) => {
              if (consultation.id === activeConsultation.id) {
                const updatedConsultation = {
                  ...consultation,
                  messages: [...consultation.messages, adminResponse],
                }
                return updatedConsultation
              }
              return consultation
            }),
          )

          setActiveConsultation((prev) => {
            if (prev) {
              return {
                ...prev,
                messages: [...prev.messages, adminResponse],
              }
            }
            return prev
          })
        }, 2000)
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Erro",
          description: "Falha ao enviar a mensagem.",
          variant: "destructive",
        })
      }
    }
  }

  // Abrir o seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  // Agendar uma nova consultoria
  const scheduleConsultation = async () => {
    if (!schedulingTopic.trim() || !schedulingDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    try {
      const newConsultation = await createConsultation(supabase, userId, schedulingTopic, new Date(schedulingDate))

      setConsultations((prev) => [...prev, { ...newConsultation, messages: [], unreadCount: 0 }])
      setIsSchedulingOpen(false)
      setSchedulingTopic("")
      setSchedulingDate("")

      toast({
        title: "Consultoria agendada",
        description: "Sua consultoria foi agendada com sucesso!",
      })

      // Simulate admin response after 1 second
      setTimeout(async () => {
        const adminResponse = await createMessage(
          supabase,
          newConsultation.id,
          "admin", // Assuming "admin" is a valid user ID
          `Olá! Recebi seu agendamento para ${new Date(schedulingDate).toLocaleDateString(
            "pt-BR",
          )}. Confirmo nossa consultoria sobre "${schedulingTopic}". Estarei disponível no horário marcado.`,
          null,
          null,
        )

        setConsultations((prev) =>
          prev.map((consultation) =>
            consultation.id === newConsultation.id
              ? { ...consultation, messages: [...consultation.messages, adminResponse], unreadCount: 1 }
              : consultation,
          ),
        )
      }, 1000)
    } catch (error) {
      console.error("Error scheduling consultation:", error)
      toast({
        title: "Erro",
        description: "Falha ao agendar a consultoria.",
        variant: "destructive",
      })
    }
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
                    className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                      {message.attachment_url && (
                        <div className="mt-2 space-y-2">
                          <div key={message.id}>
                            {message.attachment_url.startsWith("image") ? (
                              <div className="mt-2">
                                <img
                                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${message.attachment_url}`}
                                  alt={message.attachment_name}
                                  className="max-w-full rounded-md max-h-60 object-contain"
                                />
                                <div className="text-xs mt-1 opacity-70">{message.attachment_name}</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-background/10 rounded-md">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm truncate">{message.attachment_name}</span>
                                <a
                                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${message.attachment_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto h-6 px-2 text-muted-foreground hover:text-foreground"
                                >
                                  Baixar
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.sender_id === userId ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatDateTime(message.created_at)}
                        {message.sender_id === userId && <span className="ml-2">{message.is_read ? "✓✓" : "✓"}</span>}
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
