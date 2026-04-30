import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utilities/ui"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        dream:
          "dream-brand-bg text-dream-accent-foreground shadow-dream-card hover:brightness-105",
        dreamSoft:
          "border border-border bg-dream-highlight text-dream-accent hover:bg-dream-soft",
        dreamOutline:
          "border border-border bg-card/80 text-dream-accent shadow-sm hover:bg-dream-soft dark:bg-card/70 dark:text-violet-100",
        dreamGhost:
          "text-dream-accent hover:bg-dream-highlight hover:text-dream-accent dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground",
        panel:
          "border border-border bg-card/80 text-dream-heading shadow-dream-card hover:bg-dream-softer dark:bg-card/70 dark:text-foreground",
        panelActive:
          "border border-dream-accent dream-panel-bg text-dream-heading shadow-dream-card",
        slot:
          "border border-emerald-100 bg-white text-dream-heading hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10",
        slotActive:
          "border border-dream-accent bg-dream-highlight text-dream-heading shadow-dream-card dark:border-violet-300/40 dark:bg-dream-highlight dark:text-foreground",
        success:
          "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 rounded-full px-3 text-xs",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        pill: "h-10 rounded-full px-4",
        pillLg: "h-12 rounded-full px-8",
        card: "h-auto whitespace-normal rounded-2xl p-4 text-left",
        cardSm: "h-auto whitespace-normal rounded-xl p-3 text-left",
        icon: "h-10 w-10",
        iconSm: "h-9 w-9 rounded-xl",
        iconLg: "h-11 w-11 rounded-full",
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
