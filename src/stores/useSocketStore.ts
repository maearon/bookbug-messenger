import { create } from "zustand";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { getSocket, disconnectSocketInstance } from "@/lib/socket";
import type { SocketState } from "@/types/store";
import { playReceiveSound } from "@/lib/sound";

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    if (get().socket) return;

    const socket: Socket = getSocket(accessToken);

    // 🧹 clear old listeners (QUAN TRỌNG)
    socket.removeAllListeners();

    set({ socket });

    socket.on("online-users", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      const chatStore = useChatStore.getState();
      const myId = useAuthStore.getState().user?._id;

      chatStore.addMessage(message);

      // 🔊 PLAY SOUND nếu KHÔNG phải message của mình
        if (message.senderId !== myId) {
          playReceiveSound();
        }

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (chatStore.activeConversationId === message.conversationId) {
        chatStore.markAsSeen();
      }

      chatStore.updateConversation(updatedConversation);
    });

    socket.on("read-message", ({ conversation, lastMessage }) => {
      useChatStore.getState().updateConversation({
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      });
    });

    socket.on("new-group", (conversation) => {
      const chatStore = useChatStore.getState();
      chatStore.addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });
  },

  disconnectSocket: () => {
    disconnectSocketInstance();
    set({ socket: null, onlineUsers: [] });
  },
}));
