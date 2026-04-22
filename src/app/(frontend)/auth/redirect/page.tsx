import { redirect } from 'next/navigation'

import { getDashboardPath } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function AuthRedirectPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  redirect(getDashboardPath(user.role))
}
