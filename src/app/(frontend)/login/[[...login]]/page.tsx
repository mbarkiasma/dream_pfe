import { redirect } from 'next/navigation'

import { LoginClient } from '@/components/auth/LoginClient'
import { getDashboardPath } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string | string[]
  }>
}

function getLoginMessage(message?: string | string[]) {
  const value = Array.isArray(message) ? message[0] : message

  if (value === 'magic-link-expired') {
    return 'Votre temps est ecoule. Saisissez votre email pour generer un nouveau lien magique.'
  }

  if (value === 'verified-other-device') {
    return 'Votre email a ete verifie sur un autre appareil. Vous pouvez continuer la connexion ici.'
  }

  return ''
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user } = await getAuthenticatedDashboardUser()

  if (user) {
    redirect(getDashboardPath(user.role))
  }

  const params = await searchParams

  return <LoginClient initialMessage={getLoginMessage(params?.message)} />
}
