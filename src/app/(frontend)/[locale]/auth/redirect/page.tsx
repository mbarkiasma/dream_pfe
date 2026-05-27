'use client'

import { useAuth } from '@clerk/nextjs'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

type RedirectResponse = {
  path?: string
  error?: string
}

const authRedirectCopy = {
  fr: {
    titleLoading: 'Connexion en cours',
    description: 'Nous preparons votre espace personnel.',
    titleError: 'Connexion incomplete',
    retry: 'Reessayer',
    redirectFailed: 'Redirection impossible.',
    profileMissing: 'Session connectee, mais Payload ne trouve pas encore votre profil.',
    loginPath: '/fr/login',
  },
  en: {
    titleLoading: 'Signing in',
    description: 'We are preparing your personal space.',
    titleError: 'Incomplete sign-in',
    retry: 'Try again',
    redirectFailed: 'Unable to redirect.',
    profileMissing: 'Signed in, but Payload has not found your profile yet.',
    loginPath: '/en/login',
  },
} as const

export default function AuthRedirectPage() {
  const locale = useLocale() as 'fr' | 'en'
  const { isLoaded, isSignedIn } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const copy = authRedirectCopy[locale]

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      window.location.replace(copy.loginPath)
      return
    }

    let cancelled = false

    async function resolveDashboardPath() {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          const response = await fetch(`/api/auth/dashboard-redirect?locale=${locale}`, {
            cache: 'no-store',
            credentials: 'include',
          })

          const data = (await response.json().catch(() => ({}))) as RedirectResponse

          if (cancelled) return

          if (response.ok && data.path) {
            window.location.replace(data.path)
            return
          }

          if (response.status !== 401 && response.status !== 503) {
            setErrorMessage(data.error || copy.redirectFailed)
            return
          }
        } catch {
          if (cancelled) return
        }

        await new Promise((resolve) => setTimeout(resolve, 350))
      }

      if (!cancelled) {
        setErrorMessage(copy.profileMissing)
      }
    }

    void resolveDashboardPath()

    return () => {
      cancelled = true
    }
  }, [copy, isLoaded, isSignedIn])

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        {errorMessage ? (
          <>
            <AlertCircle className="auth-status-icon auth-status-icon-error" />
            <h1 className="auth-status-title">{copy.titleError}</h1>
            <p className="auth-status-text">{errorMessage}</p>
            <button
              className="auth-status-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              {copy.retry}
            </button>
          </>
        ) : (
          <>
            <Loader2 className="auth-status-icon auth-status-icon-spin" />
            <h1 className="auth-status-title">{copy.titleLoading}</h1>
            <p className="auth-status-text">{copy.description}</p>
          </>
        )}
      </div>
    </main>
  )
}
