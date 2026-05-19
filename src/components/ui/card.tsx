import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utilities/ui"

const cardVariants = cva("border text-card-foreground", {
  variants: {
    variant: {
      default: "border-border bg-card shadow-sm",
      surface:
        "border-[var(--mindly-border)] bg-[var(--mindly-surface)] shadow-[0_16px_38px_rgba(111,77,215,0.10)]",
      soft:
        "border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] shadow-[0_10px_26px_rgba(111,77,215,0.08)]",
      glass:
        "border-white/60 bg-white/75 shadow-[0_18px_50px_rgba(170,150,230,0.14)] backdrop-blur-md",
      dashboard:
        "border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]",
      gradient:
        "border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]",
      interactive:
        "border-[var(--mindly-border)] bg-[var(--mindly-surface)] shadow-[0_14px_36px_rgba(111,77,215,0.10)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[var(--mindly-primary-soft)] hover:shadow-[0_22px_54px_rgba(111,77,215,0.14)]",
    },
    radius: {
      default: "rounded-lg",
      md: "rounded-[18px]",
      lg: "rounded-[24px]",
      xl: "rounded-[28px]",
      "2xl": "rounded-[32px]",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    radius: "default",
    padding: "none",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant, radius, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, radius, padding, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
