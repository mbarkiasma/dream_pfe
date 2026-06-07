import type { ReactNode } from 'react'

import { CoachSidebar } from '@/components/dashboard/coach/CoachSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export const dynamic = 'force-dynamic'

export default async function CoachDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('coach')

  return (
    <section className="mindly-dashboard-page coach-dashboard">
      <div className="mindly-dashboard-shell">
        <CoachSidebar />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
