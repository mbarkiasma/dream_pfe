'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

type SplitTextProps = {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: 'chars' | 'words'
  from?: {
    opacity?: number
    y?: number
  }
  to?: {
    opacity?: number
    y?: number
  }
  threshold?: number
  rootMargin?: string
  textAlign?: 'left' | 'center' | 'right'
  onLetterAnimationComplete?: () => void
  showCallback?: boolean
}

function resolveEase(ease?: string) {
  if (ease === 'power3.out') return [0.22, 1, 0.36, 1] as const
  return [0.22, 1, 0.36, 1] as const
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'left',
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin as `${number}px` | `${number}px ${number}px` | `${number}px ${number}px ${number}px` | `${number}px ${number}px ${number}px ${number}px`,
  })

  const parts = splitType === 'words' ? text.split(/(\s+)/) : Array.from(text)

  useEffect(() => {
    if (!isInView || !showCallback || !onLetterAnimationComplete) return

    const timeout = window.setTimeout(
      onLetterAnimationComplete,
      parts.length * delay + duration * 1000,
    )

    return () => window.clearTimeout(timeout)
  }, [delay, duration, isInView, onLetterAnimationComplete, parts.length, showCallback])

  return (
    <span
      ref={ref}
      className={className}
      style={{ textAlign }}
      aria-label={text}
    >
      {parts.map((part, index) => (
        <motion.span
          key={`${part}-${index}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          initial={from}
          animate={isInView ? to : from}
          transition={{
            duration,
            delay: (index * delay) / 1000,
            ease: resolveEase(ease),
          }}
        >
          {part}
        </motion.span>
      ))}
    </span>
  )
}
