import { NotificationBell } from '@/components/dashboard/NotificationCloche'
import { ThemeToggle } from '@/components/ThemeToggle'

type DashboardTopbarProps = {
  description: string
  eyebrow?: string
  title: string
}

export function DashboardTopbar({
  description,
  eyebrow = 'Tableau de bord',
  title,
}: DashboardTopbarProps) {
  return (
    <div className="mindly-dashboard-topbar">
      <div className="mindly-dashboard-topbar-inner">
        <div>
          <p className="mindly-dashboard-eyebrow">{eyebrow}</p>
          <h1 className="mindly-dashboard-title">{title}</h1>
          <p className="mindly-dashboard-description">{description}</p>
        </div>

        <div className="mindly-dashboard-actions">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}