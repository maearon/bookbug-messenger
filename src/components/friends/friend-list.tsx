"use client"

import { useEffect, useState } from "react"
import { useSocketStore } from "@/stores/useSocketStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import type { User as UserDTO  } from "@/lib/auth"
import { SOCKET_EVENTS } from "@/lib/socket/socket-server"
import { friendService } from "@/api/services/friendService"
// import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/useAuthStore"

interface Friend {
  id: string;
  name: string;
  userName?: string;
  email: string;
  role?: string;
  avatar?: string;
  isOnline?: boolean;
}

interface FriendResponse {
  friends: { _id: string; name: string; email: string; avatar?: string; role?: string }[];
}

export function FriendList() {
  // const { data: sessionClient } = authClient.useSession();
  // const userBetterAuth = sessionClient?.user ?? null;
  const { user: userBetterAuth } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFriends()

    if (socket) {
      socket.on(SOCKET_EVENTS.USER_STATUS, ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
        setFriends((prev) => prev.map((friend) => (friend.id === userId ? { ...friend, isOnline } : friend)))
      })

      return () => {
        socket.off(SOCKET_EVENTS.USER_STATUS)
      }
    }
  }, [socket])

  const fetchFriends = async () => {
    try {
      const res = await friendService.getFriendsDialog("");
      let list =
        res.friends?.map((f) => ({
          id: f._id, // FIX: MAP _id → id
          name: f.name || f.displayName || "Unknown",
          userName: f.username || f.email.split("@")[0] || "unknown",
          email: f.email || "unknown",
          role: f.role || "user",
          avatar: f.avatarUrl || "/avatar-placeholder.svg",
          isOnline: onlineUsers.includes(f._id) ? true : false,
        })) || [];
      // remove yourself
      // list = list.filter((f) => f.id !== userMongo?._id);
      list = list.filter((f) => f.email !== userBetterAuth?.email);

      if (res) {
        setFriends(list)
      }
    } catch (error) {
      console.error("[v0] Fetch friends error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading friends...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends ({friends.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <p className="text-center text-muted-foreground">No friends yet</p>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar>
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{friend.name || friend?.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{friend?.userName || friend.email.split("@")[0]}</p>
                </div>
                <Badge variant={friend.isOnline ? "default" : "secondary"}>
                  {friend.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
