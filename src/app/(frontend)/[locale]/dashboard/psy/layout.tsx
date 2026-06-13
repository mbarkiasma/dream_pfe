import type { ReactNode } from 'react'

import config from '@payload-config'
import { getPayload } from 'payload'
import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export const dynamic = 'force-dynamic'

export default async function PsychologueDashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardRole('psy')
  const payload = await getPayload({ config })
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  return (
    <section className="mindly-dashboard-page">
      <div className="mindly-dashboard-shell">
        <PsySidebar specialty={(fullUser as any).psySpecialty ?? null} />
        <div className="dashboard-content mindly-dashboard-content">{children}</div>
      </div>
    </section>
  )
}
