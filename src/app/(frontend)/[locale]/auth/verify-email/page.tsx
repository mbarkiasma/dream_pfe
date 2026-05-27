'use client'

import { useClerk } from '@clerk/nextjs'
import { AlertCircle, Loader2, MailPlus } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

type VerificationStatus = 'checking' | 'expired'

export default function VerifyEmailPage() {
  const locale = useLocale() as 'fr' | 'en'
  const clerk = useClerk()
  const [status, setStatus] = useState<VerificationStatus>('checking')
  const redirectPath = `/${locale}/auth/redirect`
  const loginPath = `/${locale}/login?message=verified-other-device`
  const magicLinkPath = `/${locale}/login?message=magic-link-expired`
  const isEnglish = locale === 'en'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('__clerk_status') === 'expired') {
      setStatus('expired')
      return
    }

    void clerk
      .handleEmailLinkVerification(
        {
          redirectUrl: redirectPath,
          redirectUrlComplete: redirectPath,
          onVerifiedOnOtherDevice: () => {
            window.location.assign(loginPath)
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
  }, [clerk, loginPath, redirectPath])

  if (status === 'expired') {
    return (
      <main className="auth-status-page">
        <div className="auth-status-card">
          <AlertCircle className="auth-status-icon auth-status-icon-error" />
          <h1 className="auth-status-title">
            {isEnglish ? 'Your magic link expired' : 'Votre lien magique a expire'}
          </h1>
          <p className="auth-status-text">
            {isEnglish
              ? 'The login window has expired. Request a new magic link and open your latest email.'
              : 'Le delai de connexion est ecoule. Pour proteger votre compte, demandez un nouveau lien magique et ouvrez le dernier email recu.'}
          </p>
          <Link className="auth-status-button" href={magicLinkPath}>
            <MailPlus />
            {isEnglish ? 'Generate a new magic link' : 'Generer un nouveau lien magique'}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        <Loader2 className="auth-status-icon auth-status-icon-spin" />
        <h1 className="auth-status-title">
          {isEnglish ? 'Verification in progress' : 'Verification en cours'}
        </h1>
        <p className="auth-status-text">
          {isEnglish
            ? 'We are validating your magic link before redirecting you.'
            : 'Nous validons votre lien magique avant de vous rediriger.'}
        </p>
      </div>
    </main>
  )
}
