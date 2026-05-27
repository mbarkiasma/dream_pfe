'use client'

import { NotificationBell } from '@/components/dashboard/NotificationCloche'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

type DashboardTopbarProps = {
  description: string
  eyebrow?: string
  title: string
}

export function DashboardTopbar({
  description,
  eyebrow,
  title,
}: DashboardTopbarProps) {
  const locale = useLocale()
  const t = useTranslations('navbar')
  const router = useRouter()
  const pathname = usePathname()

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

        <div className="mindly-dashboard-actions flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={switchLanguage}
            className="flex h-9 items-center gap-1 rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-3 text-xs font-bold text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)]"
            aria-label={t('switchLanguage')}
            title={t('switchLanguage')}
          >
            <Languages className="h-4 w-4" />
            <span>{locale.toUpperCase()}</span>
          </button>
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
