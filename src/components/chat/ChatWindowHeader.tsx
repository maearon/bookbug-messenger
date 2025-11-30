import { useChatStore } from "@/stores/useChatStore";
import { Conversation } from "@/types/chat"
import { SidebarTrigger } from "../ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import StatusBadge from "./StatusBadge";

const ChatWindowHeader = ({ chat: propChat }: { chat?: Conversation }) => {
  const {conversations, activeConversationId} = useChatStore();
  const { data: sessionClient } = authClient.useSession();
  const user = sessionClient?.user ?? null;
  const { onlineUsers } = useSocketStore();
  const chat = propChat ?? conversations.find(c => c.id === activeConversationId) ?? undefined;

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    )
  }

  // compute otherParticipant in outer scope so it's available in JSX below
  const otherParticipant = chat.type === "direct" && "participants" in chat
    ? chat.participants.find(participant => participant._id !== user?.id) ?? null
    : null;

  if (chat.type === "group") {
    // return <GroupChatHeader chat={chat} />
  } else if (chat.type === "direct") {
    if (!user || !otherParticipant) {
      return null;
    }
    // return <DirectMessageHeader chat={chat} />
  }
  return (
  <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
    <div className="flex items-center gap-2 w-full">
      <SidebarTrigger className="-ml-1 text-foreground" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <div className="flex flex-col p-2 gap-3 w-full">
        {/* AvatarImage */}
        <div className="relative">
          {
            chat.type === "direct" ? (
              // Direct message avatar placeholder
              <>
                <UserAvatar
                  type={"sidebar"}
                  name={otherParticipant?.displayName || "Unknown User"}
                  avatarUrl={otherParticipant?.avatarUrl || undefined}
                />
                <StatusBadge 
                  status={onlineUsers.includes(otherParticipant?._id ?? "") ? "online" : "offline"}
                />
              </>
            ) : (
              // Group avatar placeholder
              chat.type === "group" && "participants" in chat && chat.participants ? (
                <GroupChatAvatar
                  participants={chat.participants}
                  type={"sidebar"}
                />
              ) : null
            )
          }
        </div>
        {/* Name */}
        <h2 className="text-foreground font-semibold">
          {
            chat.type === "direct" ? (
              otherParticipant?.displayName || "Unknown User"
            ) : (
              "name" in chat && chat.name ? chat.name : "Unnamed Group"
            )
          }
        </h2>
      </div>
    </div>
  </header>
  )
}

export default ChatWindowHeader
