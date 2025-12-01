"use client"

import { useState } from "react"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { MessageCircle } from "lucide-react"
import { SidebarInset } from "@/components/ui/sidebar"
import ChatWindowHeader from "@/components/chat/ChatWindowHeader"
import { useChatStore } from "@/stores/useChatStore"
import ChatWindowSkeleton from "@/components/chat/ChatWindowSkeleton"

interface ChatWindowLayoutProps {
  selectedConversationId: string | undefined;
}

const ChatWindowLayout = ({ selectedConversationId }: ChatWindowLayoutProps) => {
  const [refreshKey, setRefreshKey] = useState(0)
  const { activeConversationId, conversations, messageLoading: loading, messages } = useChatStore();
  const selectedConversation = conversations.find(c => c.id === activeConversationId) ?? null;
  if (!selectedConversationId) {
    return (
      <SidebarInset className="flex w-full h-full bg-transparent">
        <ChatWindowHeader />
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400">
            <MessageCircle className="h-16 w-16 text-white" />
          </div>
          <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-3xl font-bold text-transparent">
            Chào mừng bạn đến với Moji!
          </h2>
          <p className="text-gray-600">Chọn một cuộc hội thoại để bắt đầu chat!</p>
        </div>
      </SidebarInset>
    );
  } 
  if (loading) {
    return <ChatWindowSkeleton />;
  } 

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {selectedConversationId ? (
        <>
        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md dark:shadow-[0_0_10px_rgba(255,255,255,0.08)]">
          {/* Header */}
          <ChatWindowHeader chat={selectedConversation} />
          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <MessageList conversationId={selectedConversationId} />
          </div>
          {/* Footer */}
          <MessageInput conversationId={selectedConversationId} onMessageSent={handleMessageSent} />
        </SidebarInset>
        </>
      ) : (
        <SidebarInset className="flex w-full h-full bg-transparent">
          <ChatWindowHeader />
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400">
              <MessageCircle className="h-16 w-16 text-white" />
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-3xl font-bold text-transparent">
              Chào mừng bạn đến với Moji!
            </h2>
            <p className="text-gray-600">Chọn một cuộc hội thoại để bắt đầu chat!</p>
          </div>
        </SidebarInset>
      )}
    </div>
  )
}

export default ChatWindowLayout
