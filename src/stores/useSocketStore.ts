import { LastMessage } from './../types/chat/chat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, type Socket } from "socket.io-client"
import type { SocketState } from '@/types/store';
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from './useChatStore';

const CHAT_SERVICE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5001"
  : "https://node-boilerplate-pww8.onrender.com"

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;
    if (existingSocket) return;
    const socket: Socket = io(CHAT_SERVICE_URL, {
      query: { token: accessToken },
      transports: ['websocket', 'polling']
    })
    set({socket});
    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to chat service')
      // setIsConnected(true)
      // // Join general room
      // socket.emit('join_room', { roomId: 'general' })
    })
    // online users
    socket.on('online-users', (userIds) => {
      set({ onlineUsers: userIds });
    })
    // new message
    socket.on('new_message', (message, conversation, unreadCounts) => {
      useChatStore.getState().addMessage(message);
      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createAt: conversation.lastMessage.createAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        }
      };
      const updateConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      }
      if (useChatStore.getState().activeConversationId === message.conversationId) {

      }
      useChatStore.getState().updateConversation(updateConversation);
    })
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      // socket.off('connect');
      // socket.off('disconnect');
      // socket.off('message_history');
      // socket.off('new_message');
      // socket.off('user_typing');
      // socket.off('error');

      socket.disconnect()
      // socketRef.current = null
      // setIsConnected(false)
      set({socket: null});
    }
  }
}));