import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Accent variant (orange)
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-accent/30 hover:shadow-lg",
        // Success variant (green, same as primary)
        success:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        // Warning variant (orange/amber)
        warning:
          "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        // Hero and CTA with glow effects
        hero: "bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/30 hover:shadow-2xl hover:scale-[1.02]",
        cta: "bg-accent text-accent-foreground font-bold shadow-xl hover:shadow-accent/40 hover:shadow-2xl hover:scale-[1.03]",
        // Outline variants with colors
        "outline-primary":
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
        "outline-accent":
          "border-2 border-accent text-accent bg-transparent hover:bg-accent/10",
        "outline-destructive":
          "border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-14 px-10 text-lg",
        icon: "h-9 w-9",
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
