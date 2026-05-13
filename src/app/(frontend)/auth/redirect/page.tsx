'use client'

import { useAuth } from '@clerk/nextjs'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type RedirectResponse = {
  path?: string
  error?: string
}

export default function AuthRedirectPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      window.location.replace('/login')
      return
    }

    let cancelled = false

    async function resolveDashboardPath() {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          const response = await fetch('/api/auth/dashboard-redirect', {
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
            setErrorMessage(data.error || 'Redirection impossible.')
            return
          }
        } catch {
          if (cancelled) return
        }

        await new Promise((resolve) => setTimeout(resolve, 350))
      }

      if (!cancelled) {
        setErrorMessage('Session connectee, mais Payload ne trouve pas encore votre profil.')
      }
    }

    void resolveDashboardPath()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        {errorMessage ? (
          <>
            <AlertCircle className="auth-status-icon auth-status-icon-error" />
            <h1 className="auth-status-title">Connexion incomplete</h1>
            <p className="auth-status-text">{errorMessage}</p>
            <button
              className="auth-status-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reessayer
            </button>
          </>
        ) : (
          <>
            <Loader2 className="auth-status-icon auth-status-icon-spin" />
            <h1 className="auth-status-title">Connexion en cours</h1>
            <p className="auth-status-text">
              Nous preparons votre espace personnel.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
