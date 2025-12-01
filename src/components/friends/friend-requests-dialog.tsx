"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
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
import { Loader2, UserPlus, RefreshCw, UserCheck } from "lucide-react"

interface FriendRequestWithSender {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: string
  sender: {
    id: string
    username: string
    name: string
    avatar?: string
  }
}

export function FriendRequestsDialog() {
  const { accessToken } = useAuth()
  const [open, setOpen] = useState(false)

  // dữ liệu tách theo tab
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestWithSender[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestWithSender[]>([])

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  // loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  // đảm bảo loading tối thiểu 3 giây
  const fetchWithDelay = async (fetcher: () => Promise<void>) => {
    setIsLoading(true)
    const start = Date.now()

    await fetcher()

    const elapsed = Date.now() - start
    const remaining = 3000 - elapsed
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining))

    setIsLoading(false)
    setIsReloading(false)
  }

  // API load theo tab
  const loadReceived = async () => {
    const res = await fetch("/api/friends/requests/received", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const data = await res.json()
      setReceivedRequests(data.requests)
    }
  }

  const loadSent = async () => {
    const res = await fetch("/api/friends/requests/sent", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const data = await res.json()
      setSentRequests(data.requests)
    }
  }

  // Khi mở dialog → load tab đang chọn
  useEffect(() => {
    if (!open) return
    if (activeTab === "received") fetchWithDelay(loadReceived)
    else fetchWithDelay(loadSent)
  }, [open])

  // Chuyển tab vẫn phải loading
  useEffect(() => {
    if (!open) return
    if (activeTab === "received") fetchWithDelay(loadReceived)
    else fetchWithDelay(loadSent)
  }, [activeTab])

  const reloadData = () => {
    setIsReloading(true)
    if (activeTab === "received") fetchWithDelay(loadReceived)
    else fetchWithDelay(loadSent)
  }

  const handleRequest = async (id: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/friends/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) return

      if (activeTab === "received") {
        setReceivedRequests(prev => prev.filter(r => r.id !== id))
      } else {
        setSentRequests(prev => prev.filter(r => r.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const data = activeTab === "received" ? receivedRequests : sentRequests

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <UserCheck className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Lời mời kết bạn</DialogTitle>

          <div className="flex items-center justify-between">
            <DialogDescription>
              Quản lý yêu cầu kết bạn đã gửi và đã nhận.
            </DialogDescription>

            {/* Reload */}
            <Button
              variant="ghost"
              size="icon"
              onClick={reloadData}
              disabled={isReloading}
              className="ml-2"
            >
              <RefreshCw
                className={`h-4 w-4 duration-300 ${isReloading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Tabs */}
          <div className="mb-2 flex gap-2 rounded-xl bg-muted p-1">
            <button
              disabled={isLoading}
              onClick={() => setActiveTab("received")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "received"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Đã nhận
            </button>

            <button
              disabled={isLoading}
              onClick={() => setActiveTab("sent")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "sent"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Đã gửi
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pb-4">

            {/* Loader / Empty luôn giữ chiều cao ổn định */}
            <div className="min-h-[120px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="size-6 animate-spin text-purple-600" />
              ) : data.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Không có lời mời kết bạn.
                </p>
              ) : null}
            </div>

            {/* List */}
            {!isLoading &&
              data.length > 0 &&
              data.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border p-4"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={r.sender.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-teal-500 text-white font-semibold">
                      {r.sender.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">{r.sender.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{r.sender.username}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {activeTab === "received" && (
                      <Button
                        size="sm"
                        onClick={() => handleRequest(r.id, "accept")}
                        className="rounded-full border-2 border-purple-600 bg-background px-4 text-purple-600 hover:bg-purple-50"
                      >
                        Chấp nhận
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequest(r.id, "reject")}
                      className="rounded-full bg-red-600 px-4 hover:bg-red-700"
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
