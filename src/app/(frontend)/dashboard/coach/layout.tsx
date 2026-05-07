import type { ReactNode } from 'react'

import { CoachSidebar } from '@/components/dashboard/coach/CoachSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function CoachDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('coach')

  return (
    <section className="mindly-dashboard-page">
      <div className="mindly-dashboard-shell">
        <CoachSidebar />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
