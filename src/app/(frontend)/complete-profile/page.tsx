import { redirect } from 'next/navigation'

import { CompleteProfileClient } from '@/components/auth/CompleteProfileClient'
import { getDashboardPath } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function CompleteProfilePage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'etudiant') {
    redirect(getDashboardPath(user.role))
  }

  return (
    <CompleteProfileClient
      defaultFirstName={user.firstName ?? ''}
      defaultLastName={user.lastName ?? ''}
    />
  )
}
