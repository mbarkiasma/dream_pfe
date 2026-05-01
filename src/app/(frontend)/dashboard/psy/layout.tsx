import type { ReactNode } from 'react'

import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function PsychologueDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('psy')

  return (
    <section className="dream-dashboard-page">
      <div className="dream-dashboard-shell">
        <PsySidebar />
        <div className="dashboard-content dream-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
