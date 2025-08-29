import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vibrant-orange/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-vibrant-orange text-white hover:bg-vibrant-orange-600 shadow-soft hover:shadow-medium",
        destructive:
          "bg-coral text-white hover:bg-coral-600 shadow-soft hover:shadow-medium",
        outline:
          "border-2 border-dark-green-300 bg-white text-dark-green-600 hover:bg-dark-green-50 hover:border-dark-green-400 hover:text-dark-green-600 shadow-soft hover:shadow-medium",
        secondary:
          "bg-dark-green-600 text-white hover:bg-dark-green-700 shadow-soft hover:shadow-medium",
        ghost: "text-dark-green-600 hover:text-dark-green-700 hover:bg-dark-green-50",
        link: "text-vibrant-orange underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2 py-1",
        lg: "h-9 px-4 py-2",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
