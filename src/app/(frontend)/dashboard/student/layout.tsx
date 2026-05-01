import type { ReactNode } from 'react'

import { StudentSidebar } from '@/components/dashboard/student/StudentSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('etudiant')

  return (
    <section className="dream-dashboard-page">
      <div className="dream-dashboard-shell">
        <StudentSidebar />
        <div className="dashboard-content dream-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
