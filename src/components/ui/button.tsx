import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-vibrant-orange/50",
  {
    variants: {
      variant: {
        default:
          "bg-vibrant-orange text-white shadow-soft hover:bg-vibrant-orange-600 hover:shadow-medium hover:scale-105",
        destructive:
          "bg-red-500 text-white shadow-soft hover:bg-red-600 hover:shadow-medium hover:scale-105 focus-visible:ring-red-500/50",
        outline:
          "border-2 border-dark-green-300 bg-white text-dark-green-600 shadow-soft hover:bg-dark-green-50 hover:border-dark-green-400 hover:shadow-medium hover:scale-105",
        secondary:
          "bg-dark-green-600 text-white shadow-soft hover:bg-dark-green-700 hover:shadow-medium hover:scale-105",
        ghost:
          "text-dark-green-600 hover:text-dark-green-700 hover:bg-light-beige-100 hover:scale-105",
        link: "text-vibrant-orange underline-offset-4 hover:underline",
        teal: "bg-teal text-white shadow-soft hover:bg-teal-600 hover:shadow-medium hover:scale-105",
        lavender: "bg-lavender text-white shadow-soft hover:bg-lavender-600 hover:shadow-medium hover:scale-105",
      },
      size: {
          default: "h-10 px-4 py-2 rounded-md text-sm has-[>svg]:px-3",
  sm: "h-8 px-3 py-1.5 rounded-md text-xs has-[>svg]:px-2",
  lg: "h-11 px-6 py-2.5 rounded-md text-base has-[>svg]:px-4",
  xl: "h-12 px-8 py-3 rounded-md text-lg has-[>svg]:px-5",
  icon: "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
