import { useChatStore } from '@/stores/useChatStore';
import { Conversation } from '@/types/chat/chat'
import React from 'react'
import ChatCard from './ChatCard';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import UnreadCountBadge from './UnreadCountBadge';
import { useSocketStore } from '@/stores/useSocketStore';
// import { useAuthStore } from '@/stores/useAuthStore';

const DirectMessageCard = ({conversation}: {conversation: Conversation}) => {
  // const { user } = useAuthStore();
  const { data: sessionClient } = authClient.useSession();
  const user = sessionClient?.user ?? null;
  const { activeConversationId, setActiveConversation, messages, fetchMessages } = useChatStore();
  const conversations = useChatStore();
  const { onlineUsers } = useSocketStore();
  if (!user) {
    return null;
  }
  const otherParticipant = conversation.participants.find(participant => participant._id !== user.id);
  if (!otherParticipant) {
    return null;
  }
  const unreadCount = conversation.unreadCounts[user.id] || 0;
  const lastMessage = conversation.lastMessage?.content || "No messages yet";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };
  if (!conversations) {
    return;
  }
  // const groupChats = conversations.conversations.filter(conv => conv.type === "group");
  return (
    <ChatCard
      key={conversation._id}
      conversationId={conversation._id}
      name={otherParticipant.displayName ?? "Unknown User"}
      timeStamp={
        conversation.lastMessage?.createdAt 
          ? new Date(conversation.lastMessage.createdAt) 
          : undefined
      }
      isActive={activeConversationId === conversation._id}
      unreadCount={unreadCount}
      onSelect={() => handleSelectConversation(conversation._id)}
      leftSection={
        <>
          <UserAvatar type="sidebar" name={otherParticipant.displayName ?? ""} 
            avatarUrl={otherParticipant.avatarUrl ?? undefined}
          />
          <StatusBadge 
            status={onlineUsers.includes(otherParticipant?._id ?? "") ? "online" : "offline"}
          />
          {
            unreadCount && unreadCount > 0 && (
              <UnreadCountBadge unreadCount={unreadCount} />
            )
          }
        </>
      }
      subtitle={
        <p className={cn("text-sm truncate", unreadCount && unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
          {lastMessage}
        </p>
      }
    />
  )
}

export default DirectMessageCard
