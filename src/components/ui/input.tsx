import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-dark-green placeholder:text-dark-green-400 selection:bg-vibrant-orange selection:text-white border-light-beige-200 flex h-11 w-full min-w-0 rounded-md border-2 bg-white px-4 py-2.5 text-sm transition-all duration-200 outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-soft",
        "focus-visible:border-vibrant-orange focus-visible:ring-2 focus-visible:ring-vibrant-orange/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
