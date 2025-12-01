"use client"

import { useState } from "react"
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
import { UserPlus, Search, Loader2, Users, UserSearch } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import type { User as UserDTO } from "@/lib/auth"

interface AddFriendDialogProps {
  forProfilePage?: boolean
}

export function AddFriendDialog({ forProfilePage = false }: AddFriendDialogProps) {
  const { accessToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserDTO[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setErrorMessage("")
    setIsSearching(true)

    try {
      const response = await fetch(
        `/api/v1/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else {
        const data = await response.json()
        setErrorMessage(data.message || "Search failed")
      }
    } catch (error) {
      console.error("[AddFriendDialog] Search error:", error)
      setErrorMessage("Something went wrong.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    setIsSending(userId)
    try {
      const response = await fetch("/api/v1/friends/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      })

      if (response.ok) {
        // Ẩn user sau khi gửi lời mời
        setSearchResults(searchResults.filter((u) => u.id !== userId))
      } else {
        console.error("Failed to send request")
      }
    } catch (error) {
      console.error("[AddFriendDialog] Send request error:", error)
    } finally {
      setIsSending(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {forProfilePage ? (
        <Button>
          <UserSearch className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
        ) : (
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <UserSearch className="h-4 w-4 text-gray-500" />
        </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>Search for users to send friend requests</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          {/* Results */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found.
              </p>
            )}

            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30">
                <Avatar>
                  <AvatarImage src={user.image || "/avatar-placeholder.png"} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(user.id)}
                  disabled={isSending === user.id}
                >
                  {isSending === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
