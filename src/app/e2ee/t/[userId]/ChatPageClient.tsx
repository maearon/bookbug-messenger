"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { FriendRequests } from "@/components/friends/friend-requests"
import { MessageCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Session } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";

interface ChatPageClientProps {
  session: Session | null;
}

export default function ChatPageClient({ session }: ChatPageClientProps) {
  const { 
      data: sessionClient, 
      isPending, //loading state
      error, //error object
      refetch //refetch the session
  } = authClient.useSession()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFriendRequests, setShowFriendRequests] = useState(false)

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">
      <Loader2 className="text-purple-600 size-8 animate-spin" />
    </div>
  }

  if (!session?.user) {
    router.push("/login")
    return null
  }

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">        
        <AppSidebar session={session} refreshKey={refreshKey} />

        <div className="flex flex-1 flex-col bg-background">
          {selectedConversationId ? (
            <>
              <div className="flex-1 overflow-hidden">
                <MessageList conversationId={selectedConversationId} />
              </div>
              <MessageInput conversationId={selectedConversationId} onMessageSent={handleMessageSent} />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400">
                <MessageCircle className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-3xl font-bold text-transparent">
                Chào mừng bạn đến với Moji!
              </h2>
              <p className="text-gray-600">Chọn một cuộc hội thoại để bắt đầu chat!</p>
            </div>
          )}
        </div>

        {showFriendRequests && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md">
              <FriendRequests />
              <Button onClick={() => setShowFriendRequests(false)} className="mt-4 w-full bg-background text-foreground hover:bg-background">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
