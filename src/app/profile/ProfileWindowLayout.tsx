"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog"
import { FriendList } from "@/components/friends/friend-list"
import { FriendRequestsPage } from "@/components/friends/friend-requests"

import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, MailIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/useAuthStore"
import FriendSuggestionsDialog from "@/components/chat/FriendSuggestionsDialog"


export default function ProfileWindowLayout() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">    
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.image || "/avatar-placeholder.png"} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.displayName || user?.name}</h2>
                  <p className="text-muted-foreground">@{user?.username || user?.email.split("@")[0]}</p>
                </div>
              </div>
              <ProfileEditDialog />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeof user?.isEmailVerified !== "undefined" && (
                  <EmailVerificationAlert isEmailVerified={user.isEmailVerified} />
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
                {(user?.bio || "Will code for food 💻") && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p>{user.bio || "Will code for food 💻"}</p>
                  </div>
                )}
              </div>
            </CardContent>     
          </Card>

          {/* Friends List */}
          <FriendList />

          {/* Add Friend Button */}
          <div className="flex justify-end">
            <FriendSuggestionsDialog forProfilePage />
          </div>

          {/* Friend Requests */}
          <FriendRequestsPage />
        </div>
      </div>
    </div>
  )
}

interface EmailVerificationAlertProps {
  isEmailVerified?: boolean
}

function EmailVerificationAlert({ isEmailVerified }: EmailVerificationAlertProps) {
  if (isEmailVerified) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4 dark:border-green-800/50 dark:bg-green-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">
              Your email has been successfully verified.
            </span>
          </div>
          <Button size="sm" variant="outline" disabled>
            Verified
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-4 dark:border-yellow-800/50 dark:bg-yellow-950/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MailIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200">
            Please verify your email address to access all features.
          </span>
        </div>
        <Button size="sm" asChild>
          <Link href="/send-verification-email">Verify Email</Link>
        </Button>
      </div>
    </div>
  )
}
