import config from '@payload-config'
import { getPayload } from 'payload'

import { getDashboardPath, requiresInitialInterview } from '@/utilities/dashboardAuth'

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const authHeaders = new Headers(request.headers)
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const payloadTokenCookieName = `${cookiePrefix}-token`
  const cookieHeader = authHeaders.get('cookie')

  if (cookieHeader) {
    const clerkOnlyCookies = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter((cookie) => !cookie.startsWith(`${payloadTokenCookieName}=`))

    if (clerkOnlyCookies.length > 0) {
      authHeaders.set('cookie', clerkOnlyCookies.join('; '))
    } else {
      authHeaders.delete('cookie')
    }
  }

  try {
    const { user } = await payload.auth({ headers: authHeaders })

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role === 'etudiant') {
      if (user.onboardingStep === 'profile') {
        return Response.json({ path: '/complete-profile' })
      }

      if (await requiresInitialInterview(user)) {
        return Response.json({ path: '/entretien' })
      }

      return Response.json({ path: '/dashboard/student' })
    }

    return Response.json({ path: getDashboardPath(user.role) })
  } catch (error) {
    console.error('Erreur lors de la redirection apres authentification:', error)

    return Response.json({ error: 'Authentication unavailable' }, { status: 503 })
  }
}
