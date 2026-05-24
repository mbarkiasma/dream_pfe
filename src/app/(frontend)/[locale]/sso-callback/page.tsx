'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  return (
    <>
      <div
        data-cl-language="fr-FR"
        data-cl-size="flexible"
        data-cl-theme="light"
        id="clerk-captcha"
      />
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/auth/redirect"
        signInForceRedirectUrl="/auth/redirect"
        signUpFallbackRedirectUrl="/auth/redirect"
        signUpForceRedirectUrl="/auth/redirect"
      />
    </>
  )
}
