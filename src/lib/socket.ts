// src/lib/socket.ts
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io("https://moji-realtimechatapp.onrender.com", {
      auth: {
        token,
      },
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocketInstance = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
