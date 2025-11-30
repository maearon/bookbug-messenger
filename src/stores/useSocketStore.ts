import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, type Socket } from "socket.io-client"
import type { SocketState } from '@/types/store';
import { useAuthStore } from "@/stores/useAuthStore";

const CHAT_SERVICE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5005/api"
  // : "https://adidas-microservices.onrender.com/api"
  // : "https://spring-boilerplate.onrender.com/api"
  : "https://node-boilerplate-pww8.onrender.com/v1"

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;
    if (existingSocket) return;
    const socket: Socket = io(CHAT_SERVICE_URL, {
      auth: { token: accessToken },
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