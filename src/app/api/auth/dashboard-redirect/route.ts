import config from '@payload-config'
import { getPayload } from 'payload'

import { getDashboardPath, requiresInitialInterview } from '@/utilities/dashboardAuth'

function getLocaleFromRequest(request: Request) {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale')
  return locale === 'en' ? 'en' : 'fr'
}

function withLocalePath(path: string, locale: string) {
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
    return path
  }

  if (path.startsWith('/en/') || path.startsWith('/fr/') || path === '/en' || path === '/fr') {
    return path
  }

  return `/${locale}${path}`
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const payloadTokenCookieName = `${cookiePrefix}-token`

  const rawCookieHeader = request.headers.get('cookie') ?? ''
  const filteredCookies = rawCookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !c.startsWith(`${payloadTokenCookieName}=`))
    .join('; ')

  const authHeaders = new Headers(request.headers)
  if (filteredCookies) {
    authHeaders.set('cookie', filteredCookies)
  }

  const locale = getLocaleFromRequest(request)

  try {
    const { user } = await payload.auth({ headers: authHeaders })

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role === 'etudiant') {
      if (user.onboardingStep === 'profile') {
        return Response.json({ path: withLocalePath('/complete-profile', locale) })
      }

      if (await requiresInitialInterview(user)) {
        return Response.json({ path: withLocalePath('/entretien', locale) })
      }

      return Response.json({ path: withLocalePath('/dashboard/student', locale) })
    }

    return Response.json({ path: withLocalePath(getDashboardPath(user.role), locale) })
  } catch (error) {
    console.error('Erreur lors de la redirection apres authentification:', error)

    return Response.json({ error: 'Authentication unavailable' }, { status: 503 })
  }
}
