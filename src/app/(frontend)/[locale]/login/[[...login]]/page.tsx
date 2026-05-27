import type { Locale } from '@/i18n/routing'
import { redirect } from 'next/navigation'

import { LoginClient } from '@/components/auth/LoginClient'
import { getDashboardPath } from '@/utilities/dashboardAuth'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type LoginPageProps = {
  params: Promise<{
    locale: Locale
  }>
  searchParams?: Promise<{
    message?: string | string[]
    switchAccount?: string | string[]
  }>
}

function getLoginMessage(locale: Locale, message?: string | string[]) {
  const value = Array.isArray(message) ? message[0] : message

  if (value === 'magic-link-expired') {
    return locale === 'en'
      ? 'Your session has expired. Enter your email to generate a new magic link.'
      : 'Votre temps est ecoule. Saisissez votre email pour generer un nouveau lien magique.'
  }

  if (value === 'verified-other-device') {
    return locale === 'en'
      ? 'Your email was verified on another device. You can continue signing in here.'
      : 'Votre email a ete verifie sur un autre appareil. Vous pouvez continuer la connexion ici.'
  }

  return ''
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const switchAccount = Array.isArray(resolvedSearchParams?.switchAccount)
    ? resolvedSearchParams?.switchAccount[0]
    : resolvedSearchParams?.switchAccount

  if (switchAccount !== '1') {
    const { user } = await getAuthenticatedDashboardUser()

    if (user) {
      redirect(getDashboardPath(user.role))
    }
  }

  return (
    <LoginClient
      initialMessage={getLoginMessage(locale, resolvedSearchParams?.message)}
      shouldSwitchAccount={switchAccount === '1'}
    />
  )
}
