"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConversationList } from "@/components/chat/conversation-list"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { FriendRequests } from "@/components/friends/friend-requests"
import { User, LogOut, Bell, Sun, Moon, Plus, MessageCircle, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Session } from "@/lib/auth"
import { useAuth } from "@/lib/auth/auth-context";

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
  const [isDark, setIsDark] = useState(false)
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const { logout } = useAuth()

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">
      <Loader2 className="text-purple-600 size-8 animate-spin" />
    </div>
  }

  if (!session?.user) {
    router.push("/login")
    return null
  }

  const user = session.user

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setRefreshKey((prev) => prev + 1)
  }

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = async () => {
    const { error } = await authClient.revokeSessions();
    if (error) {
      return;
    }
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 50);
        },
        onError: (err) => {
          console.error("Logout failed", err);
        },
      },
    });
    logout();
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex w-[360px] flex-col bg-sidebar">
        <div className="flex items-center justify-between rounded-br-3xl rounded-tr-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
          <h1 className="text-2xl font-bold text-white">Moji</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-white hover:bg-white/20">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <button className="flex w-full items-center gap-3 rounded-xl bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Gửi Tin Nhắn Mới</span>
          </button>
        </div>

        <div className="px-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">NHÓM CHAT</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="px-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">BẠN BÈ</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowFriendRequests(true)}>
              <UserPlus className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ConversationList
            key={refreshKey}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 group">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-600 text-white">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground group-hover:dark:text-background">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Tài Khoản</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Thông Báo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
  )
}
