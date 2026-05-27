'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useLocale } from 'next-intl'

export default function SSOCallbackPage() {
  const locale = useLocale() as 'fr' | 'en'
  const redirectPath = `/${locale}/auth/redirect`

  return (
    <>
      <div
        data-cl-language={locale === 'fr' ? 'fr-FR' : 'en-US'}
        data-cl-size="flexible"
        data-cl-theme="light"
        id="clerk-captcha"
      />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={redirectPath}
        signInForceRedirectUrl={redirectPath}
        signUpFallbackRedirectUrl={redirectPath}
        signUpForceRedirectUrl={redirectPath}
      />
    </>
  )
}
