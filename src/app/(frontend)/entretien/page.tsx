import { redirect } from 'next/navigation'

import { InterviewChat } from '@/app/(frontend)/dashboard/student/interview/InterviewChat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardPath, requiresInitialInterview } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function EntretienPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'etudiant') {
    redirect(getDashboardPath(user.role))
  }

  if (user.onboardingStep === 'profile') {
    redirect('/complete-profile')
  }

  if (user.onboardingStep === 'completed' || !(await requiresInitialInterview(user))) {
    redirect('/dashboard/student')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-6 sm:px-6 lg:px-8 dark:bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-500">
            Entretien initial
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#2d1068] dark:text-foreground">
            Votre premier entretien
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6E628F] dark:text-muted-foreground">
            Repondez aux questions pour generer votre premier rapport personnalise.
          </p>
        </div>

        <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
              Entretien en cours
            </CardTitle>
          </CardHeader>

          <CardContent>
            <InterviewChat />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
