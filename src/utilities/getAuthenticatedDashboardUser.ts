import { cookies, headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getAuthenticatedDashboardUser() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()
  const cookieStore = await cookies()
  
  // 1. Correction : Valeur par défaut pour le préfixe
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const tokenCookieName = `${cookiePrefix}-token`
  
  // 2. Récupération du token
  const token = cookieStore.get(tokenCookieName)?.value

  if (!token) {
    return { user: null }
  }

  // 3. Reconstruction propre des headers
  // On utilise une instance propre pour éviter les conflits
  const headersWithCookie = new Headers()
  
  // On copie les headers importants (User-Agent, etc.)
  headersList.forEach((value, key) => {
    headersWithCookie.set(key, value)
  })

  // 4. Injection forcée du cookie de session
  // On s'assure que le header 'cookie' contient bien notre token
  headersWithCookie.set('cookie', `${tokenCookieName}=${token}`)

  try {
    const { user } = await payload.auth({ headers: headersWithCookie })
    return { user }
  } catch (error) {
    console.error("Erreur lors de l'authentification Payload:", error)
    return { user: null }
  }
}