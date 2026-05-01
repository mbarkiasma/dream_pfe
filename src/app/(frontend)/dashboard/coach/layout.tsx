import type { ReactNode } from 'react'

import { CoachSidebar } from '@/components/dashboard/coach/CoachSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function CoachDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('coach')

  return (
    <section className="dream-dashboard-page">
      <div className="dream-dashboard-shell">
        <CoachSidebar />
        <div className="dashboard-content dream-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
