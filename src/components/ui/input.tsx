import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-text placeholder:text-text-muted selection:bg-accent selection:text-white border-border flex h-11 w-full min-w-0 rounded-xl border-2 bg-surface px-4 py-3 text-base transition-all duration-200 outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:ring-coral/20 aria-invalid:border-coral",
        className
      )}
      {...props}
    />
  )
}

export { Input }
