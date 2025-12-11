"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConversationList } from "@/components/chat/conversation-list"
import { User, LogOut, Bell, Sun, Moon, Plus, MessageCircle, UserPlus, Loader2, Users, Twitter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Session } from "@/lib/auth"
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/useAuthStore";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import GroupChatList from "@/components/chat/GroupChatList";
import { NavUser } from "@/components/sidebar/nav-user";
import { mapBetterAuthUserToMongoUser } from "@/lib/mappers/user-data-to-simple-user";
import { FriendRequestsDialog } from "@/components/friends/friend-requests-dialog";
import CreateNewChat from "@/components/chat/CreateNewChat";
import NewGroupChatDialog from "@/components/chat/NewGroupChatDialog";
import AddFriendModal from "@/components/chat/AddFriendModal";
import DirectMessageList from "@/components/chat/DirectMessageList";
import { useChatStore } from "@/stores/useChatStore";
import NewDirectChatDialog from "@/components/chat/NewDirectChatDialog";
import { FriendSuggestionsDialog } from "@/components/friends/friend-suggestions-dialog";

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
  const setActiveConversation = useChatStore(state => state.setActiveConversation);  const { theme, setTheme } = useTheme();
  const { logout } = useAuth()
  const fetchConversations = useChatStore(state => state.fetchConversations);

  useEffect(() => {
    fetchConversations();
  }, []);

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
    // router.push("/login")
  }

  return (
    <Sidebar variant="inset" {...sidebarProps}>
      <SidebarMenu>
      <SidebarMenuItem>
      <div className="flex items-center justify-between rounded-br-3xl rounded-tr-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4">
        <h1 className="text-2xl font-bold text-white">Moji</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open("https://ruby-rails-boilerplate.vercel.app", "_blank")}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-white hover:bg-white/20">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      </SidebarMenuItem>
      </SidebarMenu>
      <SidebarContent className="beautiful-scrollbar">
      <div className="p-4">
      <NewDirectChatDialog />
      </div>
      {/* People you may know */}
      <SidebarGroup>
        <SidebarGroupLabel className="uppercase">
          People you may know
        </SidebarGroupLabel>
        <SidebarGroupAction title="People you may know" className="cursor-pointer">
          <FriendSuggestionsDialog />
        </SidebarGroupAction>
      </SidebarGroup>
      {/* Direct Message */}
      <SidebarGroup>
        <SidebarGroupLabel className="uppercase">
          Friend requests
        </SidebarGroupLabel>
        <SidebarGroupAction title="Kết bạn" className="cursor-pointer">
          {/* <AddFriendModal /> */}
          <FriendRequestsDialog />
        </SidebarGroupAction>

        <SidebarGroupContent>
          {/* List of group chats would go here */}
          <DirectMessageList />
        </SidebarGroupContent>
      </SidebarGroup>
      {/* Group Chat */}
      <SidebarGroup>
        <SidebarGroupLabel className="uppercase">
          GROUP CHAT
        </SidebarGroupLabel>
        <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
          <NewGroupChatDialog />
        </SidebarGroupAction>
        <SidebarGroupContent>
          {/* List of group chats would go here */}
          <GroupChatList />
        </SidebarGroupContent>
      </SidebarGroup>
      </SidebarContent>
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
      <SidebarFooter>
      {/* Footer */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <Avatar className="h-10 w-10">
            <AvatarImage src={user?.image || "/avatar-placeholder.png"} />
            <AvatarFallback className="bg-purple-600 text-white">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{user?.name}</p>
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
      </SidebarFooter>
      </div>
    </Sidebar>
  )
}

export default AppSidebar
