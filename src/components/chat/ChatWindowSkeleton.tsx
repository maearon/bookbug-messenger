// import React from "react";

import { Loader2 } from "lucide-react";

const ChatWindowSkeleton = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-purple-600" />
    </div>
  );
};

export default ChatWindowSkeleton;