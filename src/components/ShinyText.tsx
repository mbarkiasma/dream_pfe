"use client"

import type * as React from "react"

import { cn } from "@/utilities/ui"

type ShimmeringTextProps = {
  text: string
  duration?: number
  transition?: unknown
  wave?: boolean
  color?: string
  shimmeringColor?: string
} & Omit<React.ComponentPropsWithoutRef<"span">, "children">

function ShimmeringText({
  text,
  className,
  color = "var(--dream-muted)",
  ...props
}: ShimmeringTextProps) {
  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ color, ...props.style }}
      {...props}
    >
      {text}
    </span>
  )
}

export { ShimmeringText, type ShimmeringTextProps }
export default ShimmeringText
