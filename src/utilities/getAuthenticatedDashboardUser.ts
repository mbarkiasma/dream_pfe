import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getAuthenticatedDashboardUser = cache(async function getAuthenticatedDashboardUser() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()
  const authHeaders = new Headers(headersList)
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
    return { user }
  } catch (error) {
    console.error("Erreur lors de l'authentification Payload:", error)
    return { user: null }
  }
})
