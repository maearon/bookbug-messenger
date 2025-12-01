"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSocket } from "@/lib/socket/socket-context"
import { SOCKET_EVENTS } from "@/lib/socket/socket-server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageWithSender } from "@/types/chat"
import { format } from "date-fns"

interface MessageListProps {
  conversationId: string
}

export function MessageList({ conversationId }: MessageListProps) {
  const { user, accessToken } = useAuth()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
      markAsSeen()

      if (socket) {
        socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId })

        // Listen for new messages
        socket.on(SOCKET_EVENTS.MESSAGE_NEW, (newMessage: MessageWithSender) => {
          if (newMessage.conversationId === conversationId) {
            setMessages((prev) => [...prev, newMessage])
            markAsSeen()
          }
        })

        return () => {
          socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId })
          socket.off(SOCKET_EVENTS.MESSAGE_NEW)
        }
      }
    }
  }, [conversationId, socket])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("[v0] Fetch messages error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsSeen = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}/seen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      console.error("[v0] Mark seen error:", error)
    }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading messages...</div>
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-background p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Nguyễn Đức Mạnh</h3>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-background p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id

            return (
              <div key={message.id} className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex max-w-[70%] flex-col ${isOwnMessage ? "items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.type === "image" && message.fileUrl && (
                      <img
                        src={message.fileUrl || "/placeholder.svg"}
                        alt="Shared image"
                        className="mb-2 max-w-full rounded-lg"
                      />
                    )}
                    {message.type === "file" && message.fileUrl && (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-2 block underline"
                      >
                        {message.fileName || "Download file"}
                      </a>
                    )}
                    <p className="break-words">{message.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-gray-500">{format(new Date(message.createdAt), "HH:mm")}</p>
                    {isOwnMessage && <span className="text-xs text-purple-600">seen</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
