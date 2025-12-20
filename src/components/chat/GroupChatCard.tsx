"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import TypingDots from "./TypingDots";
import { parseEmoji } from "@/lib/emoji";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { typingUsers } = useSocketStore();
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts?.[user._id] ?? 0;
  const name = convo.group?.name ?? "";

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  const rawLastMessage = convo.lastMessage;

  const senderId = rawLastMessage?.sender?._id;

  const lastMessageContent = parseEmoji(rawLastMessage?.content ?? "");

  // ✅ FIX: dùng senderId thay vì sender
  const lastMessage = convo.lastMessage;
  const senderIdForOther =
    typeof lastMessage?.senderId === "string"
      ? lastMessage.senderId
      : lastMessage?.senderId?._id;

  const lastMessageText =
    senderId === user._id
      // ? `Bạn: ${lastMessageContent}`
      ? `${lastMessageContent}`
      : lastMessageContent;

  const sender = convo.participants.find(
    (p) => p._id === senderId
  );

  const typingUserIds =
    (typingUsers[convo._id] ?? []).filter(
      (id) => id !== user._id
    );

  const isTyping = typingUserIds.length > 0;

  return (
    <ChatCard
      convoId={convo._id}
      name={name}
      timestamp={
        rawLastMessage?.createdAt
          ? new Date(rawLastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {unreadCount > 0 && (
            <UnreadCountBadge unreadCount={unreadCount} />
          )}
          <GroupChatAvatar
            participants={convo.participants}
            type="chat"
          />
        </>
      }
      // subtitle={
      //   <p className="text-sm truncate text-muted-foreground">
      //     {convo.participants.length} thành viên
      //   </p>
      // }
      subtitle={
        <p className="text-sm truncate text-muted-foreground">
          {isTyping ? (
            <TypingDots />
          ) : (lastMessageText && lastMessage && (senderId || senderIdForOther)) ? (
            <>
              <span className="font-medium">
                {sender?._id === user._id ? "Bạn: " : `${senderIdForOther?.displayName}: ` || ""}
              </span>
              {/* {" "} */}
              {lastMessageText} ({convo.participants.length}) thành viên
            </>
          ) : (
            `${convo.participants.length} thành viên`
          )}
        </p>
      }
    />
  );
};

export default GroupChatCard;
