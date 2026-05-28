'use client'

import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function LogoutPage() {
  const { signOut } = useClerk()
  const t = useTranslations('logout')

  useEffect(() => {
    window.localStorage.setItem('payload-theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')

    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      void signOut({ redirectUrl: '/home' })
    })
  }, [signOut])

  return (
    <main className="auth-status-page">
      <div className="auth-status-card">
        <Loader2 className="auth-status-icon auth-status-icon-spin" />
        <h1 className="auth-status-title">{t('title')}</h1>
        <p className="auth-status-text">{t('text')}</p>
      </div>
    </main>
  )
}
