'use client'

import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export default function LogoutPage() {
  const { signOut } = useClerk()

  useEffect(() => {
    window.localStorage.setItem('payload-theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')

    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      void signOut({ redirectUrl: '/login' })
    })
  }, [signOut])

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        <Loader2 className="auth-status-icon auth-status-icon-spin" />
        <h1 className="auth-status-title">Deconnexion</h1>
        <p className="auth-status-text">
          Nous fermons votre session avant de vous rediriger.
        </p>
      </div>
    </main>
  )
}
