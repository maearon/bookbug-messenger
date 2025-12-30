"user client"

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun, Bug } from "lucide-react";
import CreateNewChat from "../chat/CreateNewChat";
import CreateNewChatDialog from "@/components/chat/CreateNewChatDialog";
import NewDirectChatDialog from "@/components/chat/NewDirectChatDialog";
import NewGroupChatModal from "../chat/NewGroupChatModal";
// import NewGroupChatDialog from "@/components/chat/NewGroupChatDialog";
import GroupChatList from "../chat/GroupChatList";
import FriendRequestsDialog from "@/components/chat/FriendRequestsDialog";
import AddFriendModal from "../chat/AddFriendModal";
import FriendSuggestionsDialog from "@/components/chat/FriendSuggestionsDialog";
import DirectMessageList from "../chat/DirectMessageList";
import { registerNextThemeSetter, useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import { useChatStore } from "@/stores/useChatStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, setTheme: setZustandTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [hasNotification, setHasNotification] = useState(true);
  const [notificationCount, setNotificationCount] = useState(1);
  const { convoLoading } = useChatStore();
  useEffect(() => {
    // Ưu tiên next-themes => sync vào Zustand
    if (theme) {
      setZustandTheme(theme === "dark");
    }
  }, [theme, setZustandTheme]);
  // Bridge: đăng ký setter của next-themes cho Zustand
  useEffect(() => {
    registerNextThemeSetter(setTheme);
  }, [setTheme]);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sidebar
      variant="inset"
      {...props}
    >
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-primary"
            >
              <Link href="/">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">Chats</h1>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(
                              "https://ruby-rails-boilerplate.vercel.app",
                              "_blank"
                            )
                          }
                          className="h-8 w-8 text-white hover:bg-white/20"
                        >
                          <Bug
                            className="h-4 w-4"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        Bugbook · 1 notification
                      </TooltipContent>
                    </Tooltip>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open("https://ruby-rails-boilerplate.vercel.app", "_blank")}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Bug className="h-4 w-4" />
                    </Button> */}
                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(
                              "https://ruby-rails-boilerplate.vercel.app",
                              "_blank"
                            )
                          }
                          className="relative h-8 w-8 hover:bg-white/20"
                        >
                          <span className="
                            absolute 
                            inset-0 
                            rounded-full 
                            border 
                            border-white/40
                          " />

                          <Bug className="relative h-4 w-4 text-[#22C55E]" />

                          {hasNotification && (
                            <span
                              className="
                                absolute 
                                -top-0.5 
                                -right-0.5 
                                min-w-[16px]
                                h-4 
                                px-1
                                flex 
                                items-center 
                                justify-center
                                rounded-full
                                bg-[#31A24C]
                                text-[10px]
                                font-semibold
                                text-white
                                ring-2 
                                ring-[#0f172a]
                              "
                            >
                              {notificationCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent side="top" align="center">
                        Bugbook · {notificationCount} notification
                      </TooltipContent>
                    </Tooltip> */}
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-white hover:bg-white/20">
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
        {/* Dirrect Message */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">bạn bè</SidebarGroupLabel>
          <SidebarGroupAction
            title="Search Messenger"
            className="cursor-pointer"
          >
            <CreateNewChatDialog />
            <FriendSuggestionsDialog />
            <AddFriendModal />
            
          </SidebarGroupAction>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">nhóm chat</SidebarGroupLabel>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="uppercase">nhóm chat</SidebarGroupLabel>
            <NewGroupChatModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* New Chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat />
            <NewDirectChatDialog />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* People you may know */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            People you may know
          </SidebarGroupLabel>
          <SidebarGroupAction title="People you may know" className="cursor-pointer">
            <FriendSuggestionsDialog />
          </SidebarGroupAction>
        </SidebarGroup>

        {/* Friends Requests */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            Friends Requests
          </SidebarGroupLabel>
          <SidebarGroupAction title="Friends Requests" className="cursor-pointer">
            <FriendRequestsDialog />
          </SidebarGroupAction>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
