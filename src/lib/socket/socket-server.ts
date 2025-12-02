// Socket.IO server setup (for reference - deploy separately)
// This file shows how to set up a Socket.IO server with Express
// Deploy this to Render or another Node.js hosting service

/*
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { verifyAccessToken } from './jwt'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }

  const payload = await verifyAccessToken(token)
  if (!payload) {
    return next(new Error('Authentication error'))
  }

  socket.data.userId = payload.userId
  next()
})

// Track online users
const onlineUsers = new Map<string, string>() // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.data.userId
  console.log(`[src/socket/socket-server.ts] User connected: ${userId}`)

  // Handle user online
  socket.on('user:online', ({ userId }) => {
    onlineUsers.set(userId, socket.id)
    // Broadcast to all friends
    socket.broadcast.emit('user:status', { userId, isOnline: true })
  })

  // Handle joining conversation rooms
  socket.on('conversation:join', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`)
  })

  // Handle leaving conversation rooms
  socket.on('conversation:leave', ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`)
  })

  // Handle new message
  socket.on('message:send', ({ conversationId, message }) => {
    // Broadcast to all users in the conversation
    io.to(`conversation:${conversationId}`).emit('message:new', message)
  })

  // Handle typing indicator
  socket.on('typing:start', ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:user', { userId, isTyping: true })
  })

  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:user', { userId, isTyping: false })
  })

  // Handle message seen
  socket.on('message:seen', ({ conversationId, userId, messageIds }) => {
    socket.to(`conversation:${conversationId}`).emit('message:seen', { userId, messageIds })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[src/socket/socket-server.ts] User disconnected: ${userId}`)
    onlineUsers.delete(userId)
    // Broadcast to all friends
    socket.broadcast.emit('user:status', { userId, isOnline: false })
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
*/

export const SOCKET_EVENTS = {
  // User events
  USER_ONLINE: "user:online",
  USER_STATUS: "user:status",

  // Conversation events
  CONVERSATION_JOIN: "conversation:join",
  CONVERSATION_LEAVE: "conversation:leave",

  // Message events
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_SEEN: "message:seen",

  // Typing events
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  TYPING_USER: "typing:user",
}
