"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, UserCheck } from "lucide-react"
import { friendService } from "@/api/services/friendService"
import { toast } from "sonner"

// UI type (normalized)
interface FriendRequestUI {
  id: string
  sender: {
    id: string
    username: string
    name: string
    email?: string;
    avatar?: string
  }
  createdAt: string
}

interface FriendRequestRaw {
  _id: string;
  from: {
    id: string;
    username?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  to: {
    id: string;
    username?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface FriendRequestsResponse {
  received: FriendRequestRaw[];
  sent: FriendRequestRaw[];
}

export function FriendRequestsDialog() {
  const [open, setOpen] = useState(false)
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestUI[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestUI[]>([])
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  const [isLoading, setIsLoading] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  // Force loading >= 3s
  const fetchWithDelay = async (fetcher: () => Promise<void>) => {
    setIsLoading(true)
    const start = Date.now()

    try {
      await fetcher()
    } catch (e) {
      console.error("Fetcher error:", e)
    }

    const elapsed = Date.now() - start
    const wait = 3000 - elapsed
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))

    setIsLoading(false)
    setIsReloading(false)
  }

  // ---- LOAD DATA ----
  const loadRequests = async () => {
    try {
      const res = await friendService.getFriendRequests()

      const received = (res?.received || []).map((r: FriendRequestRaw): FriendRequestUI => ({
        id: r._id,
        sender: {
          id: r.from?.id || "",
          name: r.from?.name || "Unknown",
          username: r.from?.username || "unknown",
          email: r.from?.email || "unknown",
          avatar: r.from?.avatar,
        },
        createdAt: r.createdAt,
      }))

      const sent = (res?.sent || []).map((r: FriendRequestRaw): FriendRequestUI => ({
        id: r._id,
        sender: {
          id: r.to?.id || "",
          name: r.to?.name || "Unknown",
          username: r.to?.username || "unknown",
          email: r.to?.email || "unknown",
          avatar: r.to?.avatar,
        },
        createdAt: r.createdAt,
      }))

      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (e) {
      console.error("loadRequests error:", e)
      setReceivedRequests([])
      setSentRequests([])
    }
  }

  // open dialog -> load data
  useEffect(() => {
    if (!open) return
    fetchWithDelay(loadRequests)
  }, [open])

  // tab change -> reload filtered list
  useEffect(() => {
    if (!open) return
    fetchWithDelay(loadRequests)
  }, [activeTab])

  const reloadData = () => {
    setIsReloading(true)
    fetchWithDelay(loadRequests)
  }

  // ---- ACCEPT / REJECT ----
  const handleRequest = async (id: string, action: "accept" | "decline") => {
    try {
      const res = await friendService.responseFriendRequest(id, action)

    //   console.log("handleRequest response:", res)
      toast.success(`${action === "accept" ? "Accepted" : "Declined"} friend request!`)

      // remove from UI
      setReceivedRequests((prev) => prev.filter((r) => r.id !== id))
      setSentRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      console.error("handleRequest error:", e)
      toast.error(e?.response?.data?.message || "ACCEPT / REJECT failed")
    }
  }

  const data = activeTab === "received" ? receivedRequests : sentRequests

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCheck className="mr-2 h-4 w-4" />
          Friend Requests
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Lời mời kết bạn</DialogTitle>

          <div className="flex items-center justify-between">
            <DialogDescription>
              Quản lý yêu cầu kết bạn đã gửi và đã nhận.
            </DialogDescription>

            <Button
              variant="ghost"
              size="icon"
              onClick={reloadData}
              disabled={isReloading}
              className="ml-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 rounded-xl bg-muted p-1">
            <button
              disabled={isLoading}
              onClick={() => setActiveTab("received")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm ${
                activeTab === "received"
                  ? "bg-background shadow"
                  : "text-muted-foreground"
              }`}
            >
              Đã nhận
            </button>

            <button
              disabled={isLoading}
              onClick={() => setActiveTab("sent")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm ${
                activeTab === "sent"
                  ? "bg-background shadow"
                  : "text-muted-foreground"
              }`}
            >
              Đã gửi
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pb-4">
            {isLoading ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
              </div>
            ) : data.length === 0 ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <p className="text-muted-foreground">Không có lời mời kết bạn.</p>
              </div>
            ) : null}

            {!isLoading &&
              data.length > 0 &&
              data.map((r) => (
                <div key={r.id} className="flex items-center gap-3 border p-4 rounded-xl">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={r.sender.avatar || "/avatar-placeholder.png"} />
                    <AvatarFallback>
                      {r.sender.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">{r.sender.name}</p>
                    {/* <p className="text-sm text-muted-foreground">@{r.sender.email.split("@")[0]}</p> */}
                    <p className="text-sm text-muted-foreground">{r.sender.email}</p>
                  </div>

                  <div className="flex gap-2">
                    {activeTab === "received" && (
                      <Button
                        size="sm"
                        className="border-2 border-purple-600 text-purple-600 bg-background"
                        onClick={() => handleRequest(r.id, "accept")}
                      >
                        Chấp nhận
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequest(r.id, "decline")}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default FriendRequestsDialog;