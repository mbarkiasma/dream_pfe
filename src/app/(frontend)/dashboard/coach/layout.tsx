import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { CoachSidebar } from '@/components/dashboard/coach/CoachSidebar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function CoachDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user } = await getAuthenticatedDashboardUser()

  // 1. Si pas d'utilisateur -> Login
  if (!user) {
    redirect('/login')
  }

  // 2. Sécurité : Si l'utilisateur n'est pas COACH
  if (user.role !== 'coach') {
    redirect(`/dashboard/${user.role === 'etudiant' ? 'student' : user.role}`)
  }

  return (
    <section className="min-h-screen w-full bg-[#edf2ff] p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6 md:min-h-[calc(100vh-3rem)]">
        <CoachSidebar />
        <div className="min-h-full flex-1 rounded-[36px] border border-white/50 bg-white/55 p-5 shadow-[0_20px_80px_rgba(148,163,184,0.15)] backdrop-blur-xl md:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}