"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { FriendRequests } from "@/components/friends/friend-requests"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Session } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import ChatWindowLayout from "./ChatWindowLayout";

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

  return (
    <SidebarProvider>
      <div className="flex flex-1 bg-background">        
        <AppSidebar 
          session={session} 
          refreshKey={refreshKey}
          onShowFriendRequests={() => setShowFriendRequests(true)}
        />

        <div className="flex h-screen w-full p-2">
          <ChatWindowLayout selectedConversationId={selectedConversationId} />
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
