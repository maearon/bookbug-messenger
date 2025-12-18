"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, MessageCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { friendService } from "@/api/services/friendService"
import { chatService } from "@/api/services/chatService"
import { useAuthStore } from "@/stores/useAuthStore"
import { authClient } from "@/lib/auth-client"
import { useChatStore } from "@/stores/useChatStore"

interface Friend {
  id: string
  name: string
  email: string
  avatar?: string
}

interface FriendResponse {
  friends: { _id: string; displayName: string; email: string; avatar?: string }[]
}

interface UserMongo {
  _id: string
  name: string
  email: string
}

export default function NewDirectChatDialog() {
  const { user: userMongo } = useAuthStore() as { user: UserMongo | null }
  const { data: sessionClient } = authClient.useSession()
  const userBetterAuth = sessionClient?.user ?? null

  const [open, setOpen] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [displayedFriends, setDisplayedFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
  const [isReloading, setIsReloading] = useState(false)

  const fetchConversations = useChatStore((state) => state.fetchConversations);
//   const setActiveConversation = useChatStore(state => state.setActiveConversation);
  const { createConversation, setActiveConversation, messages, fetchMessages } = useChatStore();

  // FETCH FRIENDS (min spinner 3s for UX)
  const fetchFriends = useCallback(
    async (q: string, forceMinDelay = false) => {
      setLoadingFriends(true)

      const delay = new Promise((resolve) => setTimeout(resolve, forceMinDelay ? 3000 : 0))

      try {
        const res: FriendResponse = await friendService.getFriendsDialog(q)
        let list =
          res.friends?.map((f) => ({
            id: f._id,
            name: f.displayName,
            email: f.email,
            avatar: f.avatar,
          })) || []

        list = list.filter((f) => f.email !== userBetterAuth?.email)

        await delay

        setFriends(list)
        setDisplayedFriends(list.slice(0, 10))
      } catch (error) {
        console.error("[NewDirectChatDialog] fetchFriends error:", error)
        toast.error("Failed to load friends")
      } finally {
        setLoadingFriends(false)
      }
    },
    [userBetterAuth?.email],
  )

  // Load friends when dialog opens
  useEffect(() => {
    if (open) {
      fetchFriends("", true)
      setSearchQuery("")
    }
  }, [open, fetchFriends])

  // Debounce search
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchFriends(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery, open, fetchFriends])

  // Reload button
  const reloadData = async () => {
    setIsReloading(true)
    await fetchFriends(searchQuery, true)
    setIsReloading(false)
  }

  // Create direct chat
  const handleCreateDirectChat = async (friend: Friend) => {
    setCreating(friend.id)

    try {
    //   const response = await chatService.createDirectChat({
    //     type: "direct",
    //     memberIds: [friend.id],
    //   })
    const id = await createConversation("direct", "", [friend.id]);

      toast.success("Chat created!")
      
      // setActiveConversation(response?.conversation?._id ?? null);

      if (!id) return;
      setActiveConversation(id);
      if (!messages[id]) {
      await fetchMessages(id);
      }

      setOpen(false)
      setSearchQuery("")
      await fetchConversations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Create chat failed")
    } finally {
      setCreating(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl bg-gray-0 p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Send new message</span>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <div className="flex items-center justify-between">
            <DialogDescription>Select a friend to chat with</DialogDescription>
            <Button variant="ghost" size="icon" onClick={reloadData} disabled={isReloading}>
              <RefreshCw className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* SEARCH INPUT */}
          <div className="flex gap-2">
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white text-black dark:bg-neutral-900 dark:text-white"
            />
            <Button disabled>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* FRIEND LIST */}
          <div className="max-h-72 overflow-y-auto space-y-2">
            {loadingFriends ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
              </div>
            ) : displayedFriends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No friends found.</p>
            ) : (
              displayedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/40">
                  <Avatar>
                    <AvatarImage src={friend.avatar || "/avatar-placeholder.png"} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>

                  <Button size="sm" onClick={() => handleCreateDirectChat(friend)} disabled={creating === friend.id}>
                    {creating === friend.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chat"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
