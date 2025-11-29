"use client"
import { useAuthStore } from '@/stores/useAuthStore'
import { Conversation } from '@/types/chat'
import { useState } from 'react'
import { Button } from '../ui/button'
import { ImagePlus, Send } from 'lucide-react'
import { Input } from '../ui/input'
import EmojiPicker from './EmojiPicker'
import { emoji } from 'zod'
import { set } from 'mongoose'
import chatService from '@/api/services/chatService'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/useChatStore'

interface MessageInputProps {
  selectedConversation: Conversation
  conversationId?: string
  onMessageSent?: () => void
}

const MessageInput = ({ 
  selectedConversation,
  // conversationId, 
  // onMessageSent 
}: MessageInputProps) => {
  const {user} = useAuthStore()
  const {sendMessage, sendGroupMessage} = useChatStore()
  const [message, setMessage] = useState("")
  if (!user) {  
    return;
  }
  const handleSend = async () => {
    if (!message.trim()) {
      return
    } 
    const currentMessage = message;
    setMessage("")
    try {
      if (selectedConversation.type === 'direct') {
        const participants = selectedConversation.participants;
        const recipient = participants.filter(p => p._id !== user.id)[0];
        if (!recipient) {
          throw new Error("Recipient not found");
        }
        await chatService.sendMessage(
          recipient._id, 
          currentMessage.trim()
        )
      } else {
        await chatService.sendGroupMessage(
          selectedConversation._id, 
          currentMessage.trim()
        )
      }
      // await chatService.sendMessage(
      //   conversationId || selectedConversation.id, 
      //   message.trim()
      // )
      // setMessage("")
      // if (onMessageSent) {
      //   onMessageSent()
      // }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message, please try again.")
    } finally {
      // setIsSending(false)  
      // setMessage("")
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent
    // <HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth">
        {/* <Send className="h-5 w-5" /> */}
        <ImagePlus className="size-4 " />
      </Button>
      <div className="flex-1 relative">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          // onKeyPress={(e) => {
          //   if (e.key === "Enter" && !e.shiftKey) {
          //     e.preventDefault()
          //     // handleSend()
          //   }
          // }}
          onKeyPress={handleKeyPress} // onKeyDown error send message twice when render component
          placeholder="Type your message..."
          className="h-9 pr-20 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
          // disabled={!selectedConversation}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button 
            asChild
            variant="ghost" 
            size="icon" 
            className="size-8 hover:bg-primary/10 transition-smooth"
            // onClick={handleSend}
          >
            {/* <Send className="h-5 w-5" /> */}
            <div>
              {/* Emoji picker */}
              <EmojiPicker 
                onchange={(emoji: string) => setMessage(`${message}${emoji}`)}
              />
            </div>
          </Button>
        </div>
      </div>
      <Button 
        // variant="primary" 
        size="icon" 
        className="bg-gradient-chat hover:shadow-grow transition-smooth hover:scale-105 size-8"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  )
}

export default MessageInput
