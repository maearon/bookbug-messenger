"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSocket } from "@/lib/socket/socket-context"
import { SOCKET_EVENTS } from "@/lib/socket/socket-server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile } from "lucide-react"

interface MessageInputProps {
  conversationId: string
  onMessageSent: () => void
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const { user, accessToken } = useAuth()
  const { socket } = useSocket()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (message && !isTyping && socket) {
      setIsTyping(true)
      socket.emit(SOCKET_EVENTS.TYPING_START, {
        conversationId,
        userId: user?.id,
      })
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socket) {
        setIsTyping(false)
        socket.emit(SOCKET_EVENTS.TYPING_STOP, {
          conversationId,
          userId: user?.id,
        })
      }
    }, 1000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, conversationId, socket, user?.id])

  const handleSend = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: message,
          type: "text",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage("")

        if (socket) {
          socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
            conversationId,
            message: data.message,
          })
        }

        onMessageSent()
      }
    } catch (error) {
      console.error("[v0] Send message error:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-800 bg-background p-4">
      <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-gray-700">
        <Paperclip className="h-5 w-5" />
      </Button>
      <div className="relative flex-1">
        <Input
          placeholder="Soan tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSending}
          className="h-12 rounded-full border-2 border-purple-200 bg-white pr-12 focus:border-purple-500 focus:ring-purple-500"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </div>
      <Button
        onClick={handleSend}
        disabled={isSending || !message.trim()}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-0 hover:from-purple-700 hover:to-fuchsia-700"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
