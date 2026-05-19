"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utilities/ui"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
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

export const appBadgeCtaClass =
  "inline-flex min-h-12 min-w-[245px] items-center justify-center whitespace-nowrap rounded-[var(--mindly-radius-md)] !border !border-transparent !bg-[image:var(--mindly-gradient-primary)] px-6 py-3 text-[15px] font-bold !text-[var(--mindly-white)] shadow-[var(--mindly-shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--mindly-shadow-xl)] active:scale-[0.98]"

export const appBadgeCtaCompactClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[14px] !border !border-transparent !bg-[image:var(--mindly-gradient-primary)] px-4 py-2 text-[13px] font-bold !text-[var(--mindly-white)] shadow-[var(--mindly-shadow-xs)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--mindly-shadow-sm)] active:scale-[0.98]"

export const appBadgeCtaSecondaryClass = appBadgeCtaClass

export const sectionBadgeClass =
  "inline-flex items-center gap-2 rounded-full border border-[var(--mindly-primary)]/35 bg-[var(--mindly-surface)] px-5 py-2 font-[family-name:var(--font-zain)] text-[13.5px] font-bold leading-none text-[var(--mindly-primary)] shadow-[var(--mindly-shadow-xs)]"

export const sectionBadgeDotClass =
  "h-2 w-2 rounded-full bg-[var(--mindly-primary)]"

export const sectionBadgeUpperClass =
  `${sectionBadgeClass} uppercase tracking-[0.18em]`

const appBadgeVariants = cva(
  "inline-flex items-center gap-2 border border-[var(--mindly-lavender-700)] bg-[var(--mindly-lavender-300)] font-[family-name:var(--font-zain)] font-bold leading-none text-[var(--mindly-primary-muted)]",
  {
    variants: {
      variant: {
        soft:
          "border-[var(--mindly-lavender-700)] bg-[var(--mindly-lavender-300)] text-[var(--mindly-primary-muted)]",
        outline:
          "border-[var(--mindly-lavender-700)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary-muted)]",
      },
      size: {
        xs: "px-3 py-1 text-[11px]",
        sm: "px-3.5 py-1.5 text-[12px]",
        md: "px-4 py-2 text-[13px]",
        lg: "px-4.5 py-2.5 text-[14px]",
      },
      casing: {
        normal: "",
        upper: "uppercase",
      },
      radius: {
        full: "rounded-full",
        pill: "rounded-full",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "md",
      casing: "normal",
      radius: "full",
    },
  }
)

type AppBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof appBadgeVariants> & {
    asChild?: boolean
    dot?: boolean
    dotClassName?: string
    icon?: React.ReactNode
  }

function AppBadge({
  asChild = false,
  className,
  dot,
  dotClassName,
  icon,
  variant,
  size,
  casing,
  radius,
  children,
  ...props
}: AppBadgeProps) {
  const Comp = asChild ? Slot : "span"

  if (asChild) {
    return (
      <Comp
        className={cn(appBadgeVariants({ variant, size, casing, radius }), className)}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      className={cn(appBadgeVariants({ variant, size, casing, radius }), className)}
      {...props}
    >
      {dot && <span className={cn("h-2 w-2 rounded-full bg-current", dotClassName)} />}
      {icon}
      {children}
    </Comp>
  )
}

export { AppBadge, Badge, appBadgeVariants, badgeVariants }
