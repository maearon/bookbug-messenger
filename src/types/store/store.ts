import { Conversation, Message } from './../chat/models';
import { user } from './../../db/schema';
import { User } from '../user';
import { Socket } from 'socket.io-client';
export type Store = {
  id: string
  name: string
  address: string
  city: string
  distance: number
  coordinates: [number, number]
  hours: Record<string, string>
  phone: string
  features: string[]
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, {
    items: Message[];
    hasMore: boolean; // infinite scroll
    nextCursor?: string | null; // pagination cursor
  }>;
  activeConversationId: string | null;
  conversationLoading: boolean;
  messageLoading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, cursor?: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>;
  sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
}

export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}