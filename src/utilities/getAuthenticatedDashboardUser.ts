import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getAuthenticatedDashboardUser = cache(async function getAuthenticatedDashboardUser() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()

  try {
    const { user } = await payload.auth({ headers: headersList })
    return { user }
  } catch (error) {
    console.error("Erreur lors de l'authentification Payload:", error)
    return { user: null }
  }
})
