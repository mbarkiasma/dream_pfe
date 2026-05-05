import type { ReactNode } from 'react'

import { StudentSidebar } from '@/components/dashboard/student/StudentSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('etudiant')

  return (
    <section className="mindly-dashboard-page">
      <div className="mindly-dashboard-shell">
        <StudentSidebar />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}