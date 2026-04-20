import type { User } from '@/payload-types'

export type DashboardRole = 'admin' | 'coach' | 'etudiant' | 'psy'

export function getUserRole(user: User | null | undefined): DashboardRole | null {
  const role = user?.role

  if (role === 'admin' || role === 'coach' || role === 'etudiant' || role === 'psy') {
    return role
  }

  return null
}

export function isAdmin(user: User | null | undefined): boolean {
  return getUserRole(user) === 'admin'
}

export function hasRole(
  user: User | null | undefined,
  roles: DashboardRole[],
): boolean {
  const role = getUserRole(user)

  return Boolean(role && roles.includes(role))
}
