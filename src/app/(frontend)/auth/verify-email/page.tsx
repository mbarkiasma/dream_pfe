'use client'

import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function VerifyEmailPage() {
  const clerk = useClerk()

  useEffect(() => {
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
        window.location.assign('/login?error=invalid-or-expired-link')
      })
  }, [clerk])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-white/70 bg-white/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(82,45,145,0.16)] backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <h1 className="mt-5 text-2xl font-bold text-[#2d1068]">Verification en cours</h1>
        <p className="mt-2 text-sm leading-6 text-[#6E628F]">
          Nous validons votre lien magique avant de vous rediriger.
        </p>
      </div>
    </main>
  )
}
