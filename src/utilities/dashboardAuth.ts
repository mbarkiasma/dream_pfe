import { redirect } from 'next/navigation'

import type { User } from '@/payload-types'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type DashboardRole = 'etudiant' | 'coach' | 'psy'

export function getDashboardPath(role: User['role'] | null | undefined): string {
  if (role === 'coach') return '/dashboard/coach'
  if (role === 'psy') return '/dashboard/psy'
  if (role === 'admin') return '/admin'

  return '/dashboard/student'
}

export async function requireDashboardRole(expectedRole: DashboardRole): Promise<User> {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== expectedRole) {
    redirect(getDashboardPath(user.role))
  }

  return user
}
