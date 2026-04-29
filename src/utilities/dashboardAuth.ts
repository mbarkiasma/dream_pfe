import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type DashboardRole = 'etudiant' | 'coach' | 'psy'

export function getDashboardPath(role: User['role'] | null | undefined): string {
  if (role === 'coach') return '/dashboard/coach'
  if (role === 'psy') return '/dashboard/psy'
  if (role === 'admin') return '/admin'

  return '/dashboard/student'
}

export async function requiresInitialInterview(user: User): Promise<boolean> {
  if (user.role !== 'etudiant' || user.onboardingStep !== 'interview') {
    return false
  }

  const payload = await getPayload({ config })

  try {
    const analyses = await payload.find({
      collection: 'analyse-personnalite',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
      where: {
        user: {
          equals: user.id,
        },
      },
    })

    if (analyses.totalDocs > 0) {
      await payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
        data: {
          onboardingStep: 'completed',
        },
      })

      return false
    }
  } catch (error) {
    console.error("Erreur lors de la verification de l'entretien initial:", error)
  }

  return true
}

export async function requireDashboardRole(expectedRole: DashboardRole): Promise<User> {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== expectedRole) {
    redirect(getDashboardPath(user.role))
  }

  if (expectedRole === 'etudiant') {
    if (user.onboardingStep === 'profile') {
      redirect('/complete-profile')
    }

    if (await requiresInitialInterview(user)) {
      redirect('/entretien')
    }
  }

  return user
}
