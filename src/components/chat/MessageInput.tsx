"use client"

import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { playSendSound } from "@/lib/sound";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  const [message, setMessage] = useState("");

  if (!user) return;

  const sendMessage = async () => {
    if (!message.trim()) return;
    const currValue = message;
    setMessage("");

    try {
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue);
        playSendSound();
      } else {
        await sendGroupMessage(selectedConvo._id, currValue);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      {/* <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth">
        <Paperclip className="size-4" />
      </Button> */}
      
      <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth">
        <ImagePlus className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          // placeholder="Type your message..."
          placeholder="Soạn tin nhắn..."
          className="h-9 pr-8 sm:pr-20 bg-white text-black dark:bg-neutral-900 dark:text-white border-border/50 focus:border-primary/50 transition-smooth"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10 transition-smooth">
            <EmojiPicker 
              // onchange={(emoji: string) => setMessage(message + emoji)} 
            />
          </Button>
        </div>
      </div>

      {/* <Button
        size="icon"
        className="bg-gradient-chat hover:shadow-grow transition-smooth hover:scale-105 size-8"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <Send className="size-4 text-white" />
      </Button> */}
      <Button
        onClick={sendMessage}
        disabled={!message.trim()}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-0 hover:from-purple-700 hover:to-fuchsia-700"
      >
        <Send className="size-4" />
      </Button>
    </div>
  )
}

export default MessageInput;
