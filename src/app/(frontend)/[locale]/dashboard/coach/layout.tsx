import type { ReactNode } from 'react'

import config from '@payload-config'
import { getPayload } from 'payload'
import { CoachSidebar } from '@/components/dashboard/coach/CoachSidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export const dynamic = 'force-dynamic'

export default async function CoachDashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardRole('coach')
  const payload = await getPayload({ config })
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  return (
    <section className="mindly-dashboard-page coach-dashboard">
      <div className="mindly-dashboard-shell">
        <CoachSidebar specialty={fullUser.coachingSpecialty ?? null} />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
