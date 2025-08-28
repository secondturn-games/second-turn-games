import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-white hover:bg-accent/90",
        secondary:
          "border-transparent bg-primary text-white hover:bg-primary/90",
        destructive:
          "border-transparent bg-coral text-white hover:bg-coral/90",
        outline: "border-primary text-primary bg-transparent hover:bg-primary/5",
        teal: "border-transparent bg-teal text-white hover:bg-teal/90",
        lavender: "border-transparent bg-lavender text-white hover:bg-lavender/90",
        highlight: "border-transparent bg-highlight text-text hover:bg-highlight/90",
        success: "border-transparent bg-teal text-white hover:bg-teal/90",
        warning: "border-transparent bg-highlight text-text hover:bg-highlight/90",
        info: "border-transparent bg-lavender text-white hover:bg-lavender/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
