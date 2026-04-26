'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/auth/redirect"
      signInForceRedirectUrl="/auth/redirect"
      signUpFallbackRedirectUrl="/auth/redirect"
      signUpForceRedirectUrl="/auth/redirect"
    />
  )
}
