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
    <div className="dream-dashboard-topbar">
      <div className="dream-dashboard-topbar-inner">
        <div>
          <p className="dream-dashboard-eyebrow">{eyebrow}</p>
          <h1 className="dream-dashboard-title">{title}</h1>
          <p className="dream-dashboard-description">{description}</p>
        </div>

        <div className="dream-dashboard-actions">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
