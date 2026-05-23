'use client'

import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/utilities/ui'

type LanguageToggleProps = {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, t, toggleLang } = useLanguage()

  return (
    <Button
      type="button"
      aria-label={t.navbar.switchLang}
      title={t.navbar.switchLang}
      onClick={(event) => {
        event.preventDefault()
        toggleLang()
      }}
      variant="ghost"
      className={cn(
        'mindly-language-toggle h-9 min-w-[4.25rem] rounded-full px-3 py-0 text-xs font-bold',
        className,
      )}
    >
      <Languages className="mindly-language-toggle-icon" />
      <span>{lang.toUpperCase()}</span>
    </Button>
  )
}
