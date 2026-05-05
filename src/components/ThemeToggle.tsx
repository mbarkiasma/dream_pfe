'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === 'dark'
  const ready = mounted && theme

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      type="button"
      aria-label={ready && isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={ready && isDark ? 'Mode clair' : 'Mode sombre'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      variant="ghost"
      size="icon"
      className={cn('h-11 w-11', className)}
    >
      {ready && isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
