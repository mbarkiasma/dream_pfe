import { redirect } from 'next/navigation'

import { LoginClient } from '@/components/auth/LoginClient'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getDashboardPath(role: string | null | undefined) {
  if (role === 'coach') return '/dashboard/coach'
  if (role === 'psy') return '/dashboard/psy'
  return '/dashboard/student'
}

export default async function LoginPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (user) {
    redirect(getDashboardPath(user.role))
  }

  return <LoginClient />
}
