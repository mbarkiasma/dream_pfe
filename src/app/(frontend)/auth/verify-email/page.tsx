'use client'

import { useClerk } from '@clerk/nextjs'
import { AlertCircle, Loader2, MailPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type VerificationStatus = 'checking' | 'expired'

export default function VerifyEmailPage() {
  const clerk = useClerk()
  const [status, setStatus] = useState<VerificationStatus>('checking')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('__clerk_status') === 'expired') {
      setStatus('expired')
      return
    }

    void clerk
      .handleEmailLinkVerification(
        {
          redirectUrl: '/auth/redirect',
          redirectUrlComplete: '/auth/redirect',
          onVerifiedOnOtherDevice: () => {
            window.location.assign('/login?message=verified-other-device')
          },
        },
        async (to) => {
          window.location.assign(to)
        },
      )
      .catch((error) => {
        console.error('Clerk email link verification error:', error)
        setStatus('expired')
      })
  }, [clerk])

  if (status === 'expired') {
    return (
      <main className="auth-status-page">
        <div className="auth-status-card">
          <AlertCircle className="auth-status-icon auth-status-icon-error" />
          <h1 className="auth-status-title">Votre lien magique a expire</h1>
          <p className="auth-status-text">
            Le delai de connexion est ecoule. Pour proteger votre compte, demandez un nouveau lien
            magique et ouvrez le dernier email recu.
          </p>
          <Link className="auth-status-button" href="/login?message=magic-link-expired">
            <MailPlus />
            Generer un nouveau lien magique
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        <Loader2 className="auth-status-icon auth-status-icon-spin" />
        <h1 className="auth-status-title">Verification en cours</h1>
        <p className="auth-status-text">
          Nous validons votre lien magique avant de vous rediriger.
        </p>
      </div>
    </main>
  )
}
