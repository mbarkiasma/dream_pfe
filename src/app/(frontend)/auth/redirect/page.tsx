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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-border bg-card/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(82,45,145,0.16)] backdrop-blur-xl">
        {errorMessage ? (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="mt-5 text-2xl font-bold text-dream-heading">Connexion incomplete</h1>
            <p className="mt-2 text-sm leading-6 text-dream-muted">{errorMessage}</p>
            <button
              className="mt-6 rounded-2xl bg-dream-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reessayer
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-dream-accent" />
            <h1 className="mt-5 text-2xl font-bold text-dream-heading">Connexion en cours</h1>
            <p className="mt-2 text-sm leading-6 text-dream-muted">
              Nous preparons votre espace personnel.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
