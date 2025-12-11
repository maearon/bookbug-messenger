"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, UserPlus, UserSearch } from "lucide-react";
import { friendService } from "@/api/services/friendService";
import { getAccessToken } from "@/lib/token";
import { toast } from "sonner";

interface AddFriendDialogProps {
  forProfilePage?: boolean;
}

interface SuggestionUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isFriend?: boolean;
  isSelf?: boolean;
}

// ------------------------------------------
// Component
// ------------------------------------------

export function FriendSuggestionsDialog({ forProfilePage = false }: AddFriendDialogProps) {
  const accessToken = getAccessToken();

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const [isSending, setIsSending] = useState<string | null>(null);

  // ------------------------------------------
  // Wrapper delay >= 3s
  // ------------------------------------------
  const fetchWithDelay = async (fetcher: () => Promise<void>) => {
    setIsLoading(true);
    const start = Date.now();

    try {
      await fetcher();
    } catch (e) {
      console.error("fetch error:", e);
    }

    const elapsed = Date.now() - start;
    const wait = 3000 - elapsed;

    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    setIsLoading(false);
    setIsReloading(false);
  };

  // ------------------------------------------
  // Load suggestions
  // ------------------------------------------
  const loadSuggestions = async () => {
    try {
      const response = await fetch(
        `https://node-boilerplate-pww8.onrender.com/v1/friends/suggestions`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load suggestions");

      const data = await response.json();

      const normalized = (data.users || []).map((u: any) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        isFriend: u.isFriend,
        isSelf: u.isSelf,
      }));

      setSuggestions(normalized);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  // Open dialog → load
  useEffect(() => {
    if (!open) return;
    fetchWithDelay(loadSuggestions);
  }, [open]);

  // Reload button
  const reloadData = () => {
    setIsReloading(true);
    fetchWithDelay(loadSuggestions);
  };

  // ------------------------------------------
  // Send friend request
  // ------------------------------------------
  const handleSendRequest = async (userId: string) => {
    setIsSending(userId);

    try {
      const res = await friendService.addFriend(userId);

      if (res.status === 201) {
        toast.success(res.data.msg);

        // Remove from UI
        setSuggestions((prev) => prev.filter((u) => u._id !== userId));
      } else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {forProfilePage ? (
          <Button>
            <UserSearch className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        ) : (
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Friend Suggestions
        </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Gợi ý kết bạn</DialogTitle>

          <div className="flex items-center justify-between">
            <DialogDescription>
              Những người bạn có thể quen.
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

        {/* Content */}
        <div className="px-6 space-y-4">
          <div className="space-y-3 max-h-[420px] overflow-y-auto pb-4">
            {isLoading ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="min-h-[120px] flex items-center justify-center">
                <p className="text-muted-foreground">Không có gợi ý nào.</p>
              </div>
            ) : null}

            {!isLoading &&
              suggestions.length > 0 &&
              suggestions.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 border p-4 rounded-xl"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.avatar || "/avatar-placeholder.png"}
                    />
                    <AvatarFallback>
                      {user.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    {user.isSelf && (
                      <span className="text-xs text-green-600 font-medium">
                        Bạn
                      </span>
                    )}

                    {user.isFriend && (
                      <span className="text-xs text-green-600 font-medium">
                        Bạn bè
                      </span>
                    )}
                  </div>

                  {!user.isFriend && !user.isSelf && (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user._id)}
                      disabled={isSending === user._id}
                    >
                      {isSending === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Kết bạn"
                      )}
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
