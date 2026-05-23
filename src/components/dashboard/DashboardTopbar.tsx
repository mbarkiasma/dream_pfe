import { NotificationBell } from '@/components/dashboard/NotificationCloche'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'

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
  return (
    <div className="mindly-dashboard-topbar">
      <div className="mindly-dashboard-topbar-inner">
        <div>
          {eyebrow ? <p className="mindly-dashboard-eyebrow">{eyebrow}</p> : null}
          <h1 className="mindly-dashboard-title">{title}</h1>
          <p className="mindly-dashboard-description">{description}</p>
        </div>

        <div className="mindly-dashboard-actions">
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
