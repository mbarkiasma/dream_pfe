import type { ReactNode } from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'

export default async function PsychologueDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  return (
    <section className="min-h-screen w-full bg-[#edf2ff] p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6 md:min-h-[calc(100vh-3rem)]">
        <PsySidebar />

        <div className="min-h-full flex-1 rounded-[36px] border border-white/50 bg-white/55 p-5 shadow-[0_20px_80px_rgba(148,163,184,0.15)] backdrop-blur-xl md:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}