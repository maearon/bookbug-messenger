// "use client"

// import { useEffect, useState } from "react"
// import { authClient } from "@/lib/auth-client";
// import { Button } from "@/components/ui/button"
// import { FriendRequestsDialog } from "@/components/friends/friend-requests-dialog";
// import { Loader2 } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { Session } from "@/lib/auth"
// import { SidebarProvider } from "@/components/ui/sidebar";
// import AppSidebar from "./AppSidebar";
// // import ChatWindowLayout from "./ChatWindowLayout";
// import ChatWindowLayout from "@/components/chat-old/ChatWindowLayout"

// interface ChatPageClientProps {
//   session: Session | null;
// }

// export default function ChatPageClient({ session }: ChatPageClientProps) {
//   const { 
//       data: sessionClient,
//       isPending,
//       error,
//       refetch
//   } = authClient.useSession()

//   const router = useRouter()
//   const [selectedConversationId, setSelectedConversationId] = useState<string>(
//     "YnhAyaqjpK7Z7SCs0FWO1M2CuhSBhD1h"
//   )
//   const [refreshKey, setRefreshKey] = useState(0)
//   const [showFriendRequests, setShowFriendRequests] = useState(false)

//   // -------------- FIX REDIRECT ERROR --------------
//   useEffect(() => {
//     // session (từ props) hoặc sessionClient (từ hook) đều có thể được dùng
//     const finalSession = sessionClient ?? session

//     if (!isPending && !finalSession?.user) {
//       router.push("/login")
//     }
//   }, [session, sessionClient, isPending, router])
//   // ------------------------------------------------

//   if (isPending) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="text-purple-600 size-8 animate-spin" />
//       </div>
//     )
//   }

//   // Khi session chưa có & đang xử lý redirect → tránh render UI
//   const finalSession = sessionClient ?? session
//   if (!finalSession?.user) return null

//   return (
//     <SidebarProvider>
//       <div className="flex flex-1 bg-background">        
//         <AppSidebar 
//           session={finalSession}
//           refreshKey={refreshKey}
//           onShowFriendRequests={() => setShowFriendRequests(true)}
//         />

//         <div className="flex h-screen w-full p-2">
//           {/* <ChatWindowLayout selectedConversationId={selectedConversationId} /> */}
//           <ChatWindowLayout />
//         </div>

//         {showFriendRequests && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
//             <div className="w-full max-w-md">
//               <FriendRequestsDialog />
//               {/* <Button onClick={() => setShowFriendRequests(false)} className="mt-4 w-full bg-background text-foreground hover:bg-background">
//                 Close
//               </Button> */}
//             </div>
//           </div>
//         )}
//       </div>
//     </SidebarProvider>
//   )
// }
