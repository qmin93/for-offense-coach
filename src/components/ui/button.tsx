import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variants - Unified Blue Design System
 *
 * Primary hierarchy:
 * - default/primary: Strong blue fill (main CTA)
 * - secondary: Blue outline (secondary action)
 * - ghost: Blue text only (tertiary action)
 *
 * Special variants:
 * - hero: Primary with glow effect (landing page CTA)
 * - cta: Primary with stronger glow (conversion focused)
 * - destructive: Red for dangerous actions
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // === PRIMARY BLUE VARIANTS ===
        // Main CTA - Strong blue fill
        default:
          "bg-brand-blue text-white shadow-md hover:bg-brand-blue-hover hover:shadow-lg",
        primary:
          "bg-brand-blue text-white shadow-md hover:bg-brand-blue-hover hover:shadow-lg",

        // Secondary - Blue outline
        secondary:
          "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/10",

        // Ghost - Blue text only
        ghost:
          "text-brand-blue hover:bg-brand-blue/10",

        // === SPECIAL VARIANTS ===
        // Hero CTA with glow
        hero:
          "bg-brand-blue text-white font-bold shadow-lg hover:bg-brand-blue-hover hover:shadow-brand-blue/30 hover:shadow-xl hover:scale-[1.02]",

        // Strong CTA with pulse glow
        cta:
          "bg-brand-blue text-white font-bold shadow-xl hover:bg-brand-blue-hover hover:shadow-brand-blue/40 hover:shadow-2xl hover:scale-[1.03] animate-pulse-glow",

        // === UTILITY VARIANTS ===
        // Link style
        link:
          "text-brand-blue underline-offset-4 hover:underline",

        // Outline (alias for secondary)
        outline:
          "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/10",

        // Muted - Subtle background
        muted:
          "bg-muted text-muted-foreground hover:bg-muted/80",

        // === DANGER VARIANT ===
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",

        // === LEGACY SUPPORT (backwards compatible) ===
        accent:
          "bg-brand-blue text-white shadow-sm hover:bg-brand-blue-hover",
        success:
          "bg-brand-blue text-white shadow-sm hover:bg-brand-blue-hover",
        warning:
          "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        "outline-primary":
          "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/10",
        "outline-accent":
          "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/10",
        "outline-destructive":
          "border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
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
