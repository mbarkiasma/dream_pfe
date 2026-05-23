'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

const chromeExcludedPrefixes = [
  '/auth',
  '/complete-profile',
  '/dashboard',
  '/entretien',
  '/login',
  '/logout',
  '/next',
  '/preview',
  '/sso-callback',
]

export function FrontendChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showChrome = !chromeExcludedPrefixes.some((prefix) => pathname.startsWith(prefix))

  return (
    <LanguageProvider>
      {showChrome ? (
        <div className="mindly-public flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      ) : (
        children
      )}
    </LanguageProvider>
  )
}
