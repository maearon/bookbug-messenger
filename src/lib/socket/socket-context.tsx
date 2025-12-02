"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken, setAccessToken } from "@/lib/token";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  jwtToken: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, isLoading, refreshAccessToken } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // -----------------------------------------------------
  // 🟡 Ưu tiên: accessToken (từ useAuth) → fallback: local
  // -----------------------------------------------------
  useEffect(() => {
    if (accessToken) {
      console.log("[socket] useAuth token available:", accessToken);
      setJwtToken(accessToken);
      setAccessToken(accessToken);
    } else {
      const saved = getAccessToken();
      if (saved) {
        console.log("[socket] loaded from localStorage:", saved);
        setJwtToken(saved);
      }
    }
  }, [accessToken]);

  // -----------------------------------------------------
  // 🔁 Auto refresh token mỗi 10 phút → reauth socket
  // -----------------------------------------------------
  useEffect(() => {
    if (!user) return;
    if (!jwtToken) return;

    const interval = setInterval(async () => {
      console.log("[socket] Auto refreshing access token...");

      const newToken = await refreshAccessToken();
      if (!newToken) return;

      setAccessToken(newToken);
      setJwtToken(newToken);

      if (socketRef.current) {
        socketRef.current.auth = { token: newToken };
        socketRef.current.connect();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, jwtToken]);

  // -----------------------------------------------------
  // 🔵 Tạo socket khi: user OK + !isLoading + có token
  // -----------------------------------------------------
  useEffect(() => {
    // 🚫 Nếu đang loading dữ liệu auth → chưa tạo socket
    // if (isLoading) {
    //   console.log("[socket] Waiting for auth loading...");
    //   return;
    // }

    // 🚫 Nếu chưa login
    // if (!user) {
    //   console.log("[socket] No user → disconnect socket");
    //   if (socketRef.current) socketRef.current.disconnect();
    //   socketRef.current = null;
    //   setIsConnected(false);
    //   return;
    // }

    // 🚫 Chưa có token → chưa tạo socket, chờ token có
    if (!jwtToken) {
      console.log("[socket] Waiting for jwtToken...");
      return;
    }

    console.log("[socket] Creating NEW socket with token:", jwtToken);

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: jwtToken },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[v0] Socket connected user id: ${user?.id}, user email:${user?.email}, socketid: ${socket.id}`, user, socket);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log(`[v0] Socket disconnected user id: ${user?.id}, user email:${user?.email}, socketid: ${socket.id}`, user, socket);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] Connect error:", err.message);
    });

    return () => {
      console.log("[socket] Cleanup disconnect");
      socket.disconnect();
    };
  }, [user, jwtToken, isLoading]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        jwtToken,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be inside <SocketProvider>");
  return ctx;
}
