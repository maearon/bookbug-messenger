"use client";

import UserAvatar from "./UserAvatar";
import { LoadingDots } from "../products/enhanced-product-form";
import TypingDots from "./TypingDots";
import TypingDotsStatic from "./TypingDotsStatic";

interface TypingIndicatorMessageProps {
  userName?: string;
  avatarUrl?: string;
}

const TypingIndicatorMessage = ({
  userName,
  avatarUrl,
}: TypingIndicatorMessageProps) => {
  return (
    <div className="flex items-end gap-2 max-w-[70%]">
      {/* Avatar */}
      {/* <UserAvatar
        type="chat"
        name={userName ?? ""}
        avatarUrl={avatarUrl}
      /> */}
      <UserAvatar
        type="chat"
        name={userName ?? "Bugbook"}
        avatarUrl={avatarUrl ?? undefined}
      />

      {/* Bubble  animate-pulse */}
      <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground shadow-sm">
        <TypingDotsStatic />
      </div>
    </div>
  );
};

export default TypingIndicatorMessage;
