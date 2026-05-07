import { redirect } from 'next/navigation'

import { InterviewChat } from '@/app/(frontend)/dashboard/student/interview/InterviewChat'
import { ThemeToggle } from '@/components/ThemeToggle'
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
    <main className="interview-page">
      <div className="interview-container">
        <div className="interview-hero">
          <div>
            <p className="interview-kicker">Entretien initial</p>
            <h1 className="interview-title">Votre premier entretien</h1>
            <p className="interview-subtitle">
              Repondez aux questions pour generer votre premier rapport personnalise, dans un
              espace calme et confidentiel.
            </p>
          </div>

          <ThemeToggle className="interview-theme-toggle" />
        </div>

        <section className="interview-card">
          <div className="interview-card-header">
            <h2 className="interview-card-title">Entretien en cours</h2>
          </div>

          <div className="interview-card-body">
            <InterviewChat />
          </div>
        </section>
      </div>
    </main>
  )
}
