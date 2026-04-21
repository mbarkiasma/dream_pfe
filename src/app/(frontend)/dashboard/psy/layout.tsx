import type { ReactNode } from 'react'

import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'
import { requireDashboardRole } from '@/utilities/dashboardAuth'

export default async function PsychologueDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole('psy')

  return (
    <section className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6 md:min-h-[calc(100vh-3rem)]">
        <PsySidebar />
        <div className="min-h-full flex-1 overflow-hidden rounded-[36px] border border-white/70 bg-white/55 p-5 shadow-[0_24px_90px_rgba(109,40,217,0.14)] backdrop-blur-xl md:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}
