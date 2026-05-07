import type { ReactNode } from 'react'

import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function PsychologueDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('psy')

  return (
    <section className="mindly-dashboard-page">
      <div className="mindly-dashboard-shell">
        <PsySidebar />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
