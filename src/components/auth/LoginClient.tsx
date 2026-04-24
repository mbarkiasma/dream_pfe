'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function LoginClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/auth/redirect')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-[#6D28D9] shadow-[0_12px_34px_rgba(109,40,217,0.10)]">
                <ShieldCheck className="h-4 w-4" />
                Espace securise Dream
              </div>
              <h1 className="text-5xl font-bold leading-tight text-[#2d1068]">
                Connectez-vous a votre espace d'accompagnement.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#6E628F]">
                Connectez-vous avec Google ou recevez un lien magique par email.
              </p>
            </div>
          </section>

          <section className="flex justify-center">
            <SignIn
              fallbackRedirectUrl="/auth/redirect"
              forceRedirectUrl="/auth/redirect"
              path="/login"
              routing="path"
            />
          </section>
        </div>
      </div>
    </main>
  )
}
