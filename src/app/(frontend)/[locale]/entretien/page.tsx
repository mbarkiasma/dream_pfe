import { redirect } from 'next/navigation'

import { InterviewChat } from '@/app/(frontend)/[locale]/dashboard/student/interview/InterviewChat'
import { EntretienHeader } from '@/app/(frontend)/[locale]/entretien/EntretienHeader'
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
      <div className="interview-simple-layout">
        <EntretienHeader />

        <InterviewChat />
      </div>
    </main>
  )
}
