"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context"

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  jwtToken: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  const router = useRouter();
  const { data: sessionClient, isPending } = authClient.useSession();

  const user = sessionClient?.user ?? null;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // 🟢 Redirect nếu không có user
  useEffect(() => {
    if (!isPending && !user) {
      // router.push("/");
    }
  }, [isPending, user, router]);

  // 🟡 Lấy JWT token cho socket
  useEffect(() => {
    if (!user) {
      setJwtToken(null);
      return;
    }

    const fetchJWT = async () => {
      try {
        // const res = await fetch("/api/auth/jwt", { method: "POST" });
        // if (res.ok) {
        //   const data = await res.json();
        //   setJwtToken(data.tokens.access.token);
        // }
        setJwtToken(accessToken);
      } catch (err) {
        console.error("[v0] Failed to fetch JWT:", err);
      }
    };

    fetchJWT();
  }, [user]);

  // 🔵 Tạo socket kết nối
  useEffect(() => {
    // if (!user || !jwtToken) return;
    // Đợi session load xong
    if (isPending) return;

    // Không có user => không tạo socket
    if (!user) {
      setSocket(null);
      return;
    }

    // Chưa có token => không tạo socket
    if (!jwtToken) return;

    // Nếu đã có socket cũ => đóng trước
    if (socket) {
      socket.disconnect();
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002", {
      auth: { token: jwtToken },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log(`[v0] Socket connected user id: ${user.id}, user email:${user.email}, socketid: ${socketInstance.id}`, user, socketInstance);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log(`[v0] Socket disconnected user id: ${user.id}, user email:${user.email}, socketid: ${socketInstance.id}`, user, socketInstance);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[v0] Socket connection error:", error);
    });

    socketInstance.on("error", (data: { message: string }) => {
      console.error("[v0] Socket error:", data.message);
    });

    setSocket(socketInstance);

    // 🟢 cleanup chuẩn kiểu void
    return () => {
      socketInstance.disconnect();
    };
  }, [isPending, jwtToken, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, jwtToken }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
