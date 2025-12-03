import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        "appearance-none shadow-none !shadow-none", // <<<<<< TẮT SHADOW TẠI ĐÂY
        className
      )}
      {...props}
    />
  )
}

export { Input }
