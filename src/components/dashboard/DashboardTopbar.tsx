'use client'

import { Globe, Moon, Sun } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { useTheme } from '@/providers/Theme'

import { NotificationBell } from '@/components/dashboard/NotificationCloche'

type DashboardTopbarProps = {
  description: string
  eyebrow?: string
  title: string
}

export function DashboardTopbar({ description, eyebrow, title }: DashboardTopbarProps) {
  const locale = useLocale()
  const t = useTranslations('navbar')
  const router = useRouter()
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && theme === 'dark'

  const switchLanguage = () => {
    router.replace(pathname, { locale: locale === 'fr' ? 'en' : 'fr' })
  }

  return (
    <div className="mindly-dashboard-topbar">
      <div className="mindly-dashboard-topbar-inner">
        <div>
          {eyebrow ? <p className="mindly-dashboard-eyebrow">{eyebrow}</p> : null}
          <h1 className="mindly-dashboard-title">{title}</h1>
          <p className="mindly-dashboard-description">{description}</p>
        </div>

        <div className="mindly-dashboard-actions flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
            aria-label={isDark ? t('lightMode') : t('darkMode')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={switchLanguage}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
            aria-label={t('switchLanguage')}
            title={`${locale.toUpperCase()} — ${t('switchLanguage')}`}
          >
            <Globe className="h-4 w-4" />
          </button>

          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
