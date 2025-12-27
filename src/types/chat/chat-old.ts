// types/chat/chat.ts
export interface UserSummary {
  id: string
  name: string
  email?: string
  avatar?: string | null
}

export interface MessageSummary {
  id: string
  senderId: string
  content: string
  createdAt: string
}

// export interface ConversationWithDetails {
//   id: string
//   name?: string | null
//   type: "private" | "group"
//   avatar?: string | null
//   // người còn lại trong cuộc hội thoại (nếu là private)
//   otherParticipants?: UserSummary[]
//   // tin nhắn cuối cùng
//   lastMessage?: MessageSummary | null
//   // số tin nhắn chưa đọc (client tính hoặc backend gửi về)
//   unreadCount?: number
//   createdAt?: string
//   updatedAt?: string
// }

// export interface MessageWithSender {
//   id: string
//   conversationId: string
//   senderId: string
//   content: string
//   type: "text" | "image" | "file"
//   fileUrl?: string | null
//   fileName?: string | null
//   createdAt: string
//   updatedAt?: string
//   sender: {
//     id: string
//     name: string
//     email?: string
//     avatar?: string | null
//   }
// }

// Database Models for Bugbook Chat App
// These are TypeScript interfaces that can be used with MongoDB or PostgreSQL

export interface User {
  id: string
  username: string
  email: string
  password: string // hashed
  name: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  createdAt: Date
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  group?: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  createdAt: string;
  updatedAt: string;
}

// DTOs for API responses
export interface UserDTO {
  id: string
  username: string
  email: string
  name: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: Date
}

export interface MessageWithSender extends Message {
  sender: UserDTO
}

export interface Participant {
  _id: string;
  name: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
}

