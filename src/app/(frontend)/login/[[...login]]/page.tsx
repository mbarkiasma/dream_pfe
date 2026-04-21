import { redirect } from 'next/navigation'

import { LoginClient } from '@/components/auth/LoginClient'
import { getDashboardPath } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function LoginPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (user) {
    redirect(getDashboardPath(user.role))
  }

  return <LoginClient />
}
