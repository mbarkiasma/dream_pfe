'use client'

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-[0_12px_28px_rgba(109,40,217,0.12)] transition hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
