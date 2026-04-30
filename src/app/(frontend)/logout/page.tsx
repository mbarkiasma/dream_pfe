'use client'

import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function LogoutPage() {
  const { signOut } = useClerk()

  useEffect(() => {
    void signOut({ redirectUrl: '/login' })
  }, [signOut])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-border bg-card/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(82,45,145,0.16)] backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin text-dream-accent" />
        <h1 className="mt-5 text-2xl font-bold text-dream-heading">Deconnexion</h1>
        <p className="mt-2 text-sm leading-6 text-dream-muted">
          Nous fermons votre session avant de vous rediriger.
        </p>
      </div>
    </main>
  )
}
