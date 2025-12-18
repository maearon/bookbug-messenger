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
import { Moon, Sun, Twitter } from "lucide-react";
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewDirectChatDialog from "@/components/chat/NewDirectChatDialog";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import NewGroupChatDialog from "@/components/chat/NewGroupChatDialog";
import GroupChatList from "../chat/GroupChatList";
import FriendRequestsDialog from "@/components/chat/FriendRequestsDialog";
import AddFriendModal from "../chat/AddFriendModal";
import FriendSuggestionsDialog from "@/components/chat/FriendSuggestionsDialog";
import DirectMessageList from "../chat/DirectMessageList";
import { registerNextThemeSetter, useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, setTheme: setZustandTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
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
                  <h1 className="text-xl font-bold text-white">Moji</h1>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-white hover:bg-white/20">
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open("https://ruby-rails-boilerplate.vercel.app", "_blank")}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button> */}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
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

        {/* Dirrect Message */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">bạn bè</SidebarGroupLabel>
          <SidebarGroupAction
            title="Kết Bạn"
            className="cursor-pointer"
          >
            <AddFriendModal />
            <FriendSuggestionsDialog />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <DirectMessageList />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">nhóm chat</SidebarGroupLabel>
          <SidebarGroupAction
            title="Tạo Nhóm"
            className="cursor-pointer"
          >
            <NewGroupChatModal />
            <NewGroupChatDialog />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <GroupChatList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
