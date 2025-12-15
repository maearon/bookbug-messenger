// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Search, Loader2, Users, RefreshCw, X } from "lucide-react";
// import { toast } from "sonner";
// import { friendService } from "@/api/services/friendService";
// import chatService from "@/api/services/chatService";
// import { useAuthStore } from "@/stores/useAuthStore";
// import { authClient } from "@/lib/auth-client";
// import { useChatStore } from "@/stores/useChatStore";

// interface Friend {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
// }

// interface FriendResponse {
//   friends: { _id: string; name: string; email: string; avatar?: string }[];
// }

// interface CreateGroupPayload {
//   type: "group";
//   name: string;
//   memberIds: string[];
// }

// interface UserMongo {
//   _id: string;
//   name: string;
//   email: string;
// }

// export default function NewGroupChatDialog() {
//   const { user: userMongo } = useAuthStore() as { user: UserMongo | null };

//   const { data: sessionClient } = authClient.useSession();
//   const userBetterAuth = sessionClient?.user ?? null;

//   const [open, setOpen] = useState(false);

//   const [friends, setFriends] = useState<Friend[]>([]);
//   const [displayedFriends, setDisplayedFriends] = useState<Friend[]>([]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedMembers, setSelectedMembers] = useState<Friend[]>([]);
//   const [groupName, setGroupName] = useState("");

//   const [loadingFriends, setLoadingFriends] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [isReloading, setIsReloading] = useState(false);
//   const fetchConversations = useChatStore(state => state.fetchConversations);
//   const setActiveConversation = useChatStore(state => state.setActiveConversation);

//   // FETCH FRIENDS (min spinner 3s)
//   const fetchFriends = useCallback(
//     async (q: string, forceMinDelay = false) => {
//       setLoadingFriends(true);

//       const delay = new Promise((resolve) =>
//         setTimeout(resolve, forceMinDelay ? 3000 : 0)
//       );

//       try {
//         const res: FriendResponse = await friendService.getFriends(q);
//         let list =
//           res.friends?.map((f) => ({
//             id: f._id, // FIX: MAP _id → id
//             name: f.name,
//             email: f.email,
//             avatar: f.avatar,
//           })) || [];

//         // remove yourself
//         // list = list.filter((f) => f.id !== userMongo?._id);
//         list = list.filter((f) => f.email !== userBetterAuth?.email);

//         await delay;

//         setFriends(list);
//         setDisplayedFriends(list.slice(0, 10));
//       } catch {
//         toast.error("Failed to load friends");
//       } finally {
//         setLoadingFriends(false);
//       }
//     },
//     [userMongo?._id]
//   );

//   // load when open
//   useEffect(() => {
//     if (open) {
//       fetchFriends("", true);
//       setSelectedMembers([]); // reset when reopening dialog
//     }
//   }, [open, fetchFriends]);

//   // debounce search
//   useEffect(() => {
//     if (!open) return;
//     const t = setTimeout(() => fetchFriends(searchQuery), 300);
//     return () => clearTimeout(t);
//   }, [searchQuery, open, fetchFriends]);

//   // toggle member
//   const toggleMember = (u: Friend) => {
//     setSelectedMembers((prev) =>
//       prev.find((m) => m.id === u.id)
//         ? prev.filter((x) => x.id !== u.id)
//         : [...prev, u]
//     );
//   };

//   const isSelected = (id: string) =>
//     selectedMembers.some((m) => m.id === id);

//   // reload button
//   const reloadData = async () => {
//     setIsReloading(true);
//     await fetchFriends(searchQuery, true);
//     setIsReloading(false);
//   };

//   // create group
//   const handleCreateGroup = async () => {
//     if (!groupName.trim()) {
//       toast.error("Tên nhóm không được trống");
//       return;
//     }
//     if (selectedMembers.length === 0) {
//       toast.error("Hãy chọn ít nhất 1 thành viên");
//       return;
//     }

//     setCreating(true);
//     try {
//       const payload: CreateGroupPayload = {
//         type: "group",
//         name: groupName.trim(),
//         memberIds: selectedMembers.map((m) => m.id),
//       };

//       const response = await chatService.createGroupChat(payload);

//       toast.success("Group created!");
//       setOpen(false);
//       setSelectedMembers([]);
//       setGroupName("");
//       setSearchQuery("");
//       await fetchConversations();
//       // setActiveConversation(response?.conversation?._id ?? null);
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Create group failed");
//     } finally {
//       setCreating(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button>
//           <Users className="mr-2 h-4 w-4" />
//           Add Group
//         </Button>
//       </DialogTrigger>

//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create Group</DialogTitle>
//           <div className="flex items-center justify-between">
//             <DialogDescription>
//               Add your friends into group chat
//             </DialogDescription>

//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={reloadData}
//               disabled={isReloading}
//             >
//               <RefreshCw
//                 className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
//               />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* GROUP NAME */}
//           <Input
//             placeholder="Group name..."
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             className="bg-white text-black dark:bg-neutral-900 dark:text-white"
//           />

//           {/* SEARCH */}
//           <div className="flex gap-2">
//             <Input
//               placeholder="Search friends..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="bg-white text-black dark:bg-neutral-900 dark:text-white"
//             />
//             <Button disabled>
//               <Search className="h-4 w-4" />
//             </Button>
//           </div>

//           {/* SELECTED MEMBERS (Messenger style) */}
//           {selectedMembers.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium">Selected:</p>

//               <div className="flex flex-wrap gap-2">
//                 {selectedMembers.map((m) => (
//                   <div
//                     key={m.id}
//                     className="flex items-center gap-2 px-2 py-1 rounded-full border bg-muted/40"
//                   >
//                     <Avatar className="h-6 w-6">
//                       <AvatarImage src={m.avatar} />
//                       <AvatarFallback className="text-xs">{m.name[0]}</AvatarFallback>
//                     </Avatar>

//                     <span className="text-sm">{m.name}</span>

//                     <button
//                       onClick={() =>
//                         setSelectedMembers((prev) => prev.filter((x) => x.id !== m.id))
//                       }
//                       className="hover:bg-muted rounded-full p-1"
//                     >
//                       <X className="h-3 w-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* FRIEND LIST */}
//           <div className="max-h-72 overflow-y-auto space-y-2">
//             {loadingFriends ? (
//               <div className="min-h-[120px] flex items-center justify-center">
//                 <Loader2 className="animate-spin text-purple-600 h-6 w-6" />
//               </div>
//             ) : displayedFriends.length === 0 ? (
//               <p className="text-center text-muted-foreground py-4">
//                 No friends found.
//               </p>
//             ) : (
//               displayedFriends.map((u) => (
//                 <div
//                   key={u.id}
//                   className={`flex items-center gap-3 p-3 border rounded-lg ${
//                     isSelected(u.id) ? "bg-primary/10" : "hover:bg-muted/40"
//                   }`}
//                 >
//                   <Avatar>
//                     <AvatarImage src={u.avatar} />
//                     <AvatarFallback>{u.name[0]}</AvatarFallback>
//                   </Avatar>

//                   <div className="flex-1">
//                     <p className="font-medium">{u.name}</p>
//                     <p className="text-sm text-muted-foreground">{u.email}</p>
//                   </div>

//                   <Button variant="outline" size="sm" onClick={() => toggleMember(u)}>
//                     {isSelected(u.id) ? (
//                       <div className="flex items-center gap-1 text-red-500">
//                         <X className="h-4 w-4" /> Remove
//                       </div>
//                     ) : (
//                       "Add"
//                     )}
//                   </Button>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* CREATE BUTTON */}
//           <Button
//             onClick={handleCreateGroup}
//             disabled={
//               creating || !groupName.trim() || selectedMembers.length === 0
//             }
//             className="w-full"
//           >
//             {creating ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               "Create Group"
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
