"use client"

import * as React from "react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConversationList } from "@/components/chat/conversation-list"
import { User, LogOut, Bell, Sun, Moon, Plus, MessageCircle, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Session } from "@/lib/auth"
import { useAuth } from "@/lib/auth/auth-context";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/useAuthStore";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import GroupChatList from "@/components/chat/GroupChatList";
import { NavUser } from "@/components/sidebar/nav-user";
import { mapBetterAuthUserToMongoUser } from "@/lib/mappers/user-data-to-simple-user";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: Session | null
  refreshKey: number
  onShowFriendRequests: () => void
}

const AppSidebar = ({
  session,
  refreshKey,
  onShowFriendRequests,
  ...sidebarProps
}: AppSidebarProps) => {
  const { signOut } = useAuthStore();
  const { 
      data: sessionClient, 
      isPending, //loading state
      error, //error object
      refetch //refetch the session
  } = authClient.useSession()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const { theme, setTheme } = useTheme();
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = async () => {
    const { error } = await authClient.revokeSessions();
    if (error) {
      return;
    }
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          router.push("/");
          router.refresh();
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
          await signOut();
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
    <Sidebar variant="inset" {...sidebarProps}>
    {/* <div className="flex w-[360px] flex-col bg-sidebar"> */}
      {/* Header */}
      {/* <SidebarHeader>
      <SidebarMenu>
      <SidebarMenuItem>
      <SidebarMenuButton 
        size="lg" 
        asChild
        className="bg-gradient-primary"
      >
      <a href="#"> */}
      <div className="flex items-center justify-between rounded-br-3xl rounded-tr-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
      <h1 className="text-2xl font-bold text-white">Moji</h1>
      <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-white hover:bg-white/20">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
      </div>
      </div>
      {/* </a>
      </SidebarMenuButton>
      </SidebarMenuItem>
      </SidebarMenu>
      </SidebarHeader> */}

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
      {/* New Chat */}
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
          {/* <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4 text-gray-500" />
          </Button> */}
          {/* Add Friend Button */}
          <div className="flex justify-end">
          <AddFriendDialog />
          </div>
      </div>
      </div>

      <div className="px-4">
      <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">BẠN BÈ</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onShowFriendRequests}>
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
      </SidebarContent>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
      {/* <DropdownMenu>
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
      </DropdownMenu> */}
      {/* Footer */}
      <SidebarFooter>
        {user && <NavUser user={mapBetterAuthUserToMongoUser(user)} />}
      </SidebarFooter>
      </div>
    {/* </div> */}
    </Sidebar>
  )
}

export default AppSidebar
