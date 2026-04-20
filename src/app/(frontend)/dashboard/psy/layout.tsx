import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { PsySidebar } from '@/components/dashboard/psy/PsySidebar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function PsychologueDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user } = await getAuthenticatedDashboardUser()

  // 1. Si pas d'utilisateur -> Login
  if (!user) {
    redirect('/login')
  }

  // 2. Sécurité : Si l'utilisateur n'est pas PSY, on le renvoie vers son bon dashboard
  if (user.role !== 'psy') {
    redirect(`/dashboard/${user.role === 'etudiant' ? 'student' : user.role}`)
  }

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
