'use client'

import { useUser } from '@clerk/nextjs'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { appBadgeCtaClass } from '@/components/ui/badge'
import { Link, usePathname, useRouter, type Locale } from '@/i18n/routing'
import { useTheme } from '@/providers/Theme'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale() as Locale
  const t = useTranslations('navbar')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [accountHref, setAccountHref] = useState('/auth/redirect')
  const { setTheme, theme } = useTheme()
  const { isLoaded, isSignedIn } = useUser()
  const isDark = mounted && theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    let cancelled = false

    async function resolveAccountHref() {
      try {
        const response = await fetch(`/api/auth/dashboard-redirect?locale=${locale}`, {
          cache: 'no-store',
          credentials: 'include',
        })
        const data = (await response.json()) as { path?: string }

        if (!cancelled && response.ok && data.path) {
          setAccountHref(data.path)
        }
      } catch {
        if (!cancelled) {
          setAccountHref('/auth/redirect')
        }
      }
    }

    void resolveAccountHref()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn])

  const navLinks = [
    { label: t('home'), href: '/home' },
    { label: t('features'), href: '/fonctionnalites' },
    { label: t('about'), href: '/a-propos' },
    { label: t('contact'), href: '/contact' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const switchLanguage = () => {
    router.replace(pathname, { locale: locale === 'fr' ? 'en' : 'fr' })
  }

  const accountLabel = isLoaded && isSignedIn ? t('account') : t('login')
  const accountLink = isLoaded && isSignedIn ? accountHref : '/login'

  return (
    <nav className="sticky top-0 z-[100] border-b border-[var(--mindly-border)] bg-[var(--mindly-surface-glass)] backdrop-blur-[18px]">
      <div className="relative mx-auto flex h-[70px] w-full max-w-none items-center justify-between px-5 lg:px-14">
        <Link href="/home" className="flex flex-col lg:translate-x-4" onClick={() => setOpen(false)}>
          <span className="bg-gradient-to-r from-[#895EF8] to-[#A987FF] bg-clip-text font-[family-name:var(--font-zain)] text-[19px] font-bold leading-none text-transparent">
            MindBloom
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--mindly-purple-muted)]">
            {t('tagline')}
          </span>
        </Link>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative rounded-[var(--mindly-radius-md)] px-4 py-2 text-[14.5px] font-bold transition-all duration-200 ${
                  active
                    ? 'border border-transparent bg-[var(--mindly-surface)] text-[var(--mindly-primary)] shadow-[var(--mindly-shadow-xs)]'
                    : 'border border-transparent text-[var(--mindly-purple-muted)] hover:bg-[var(--mindly-primary-soft-3)] hover:text-[var(--mindly-primary)]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-[8px] left-1/2 h-[2.5px] w-[22px] -translate-x-1/2 rounded-full bg-[image:var(--mindly-gradient-primary)] transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </Link>
            )
          })}

        </div>

        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-8 md:flex lg:right-10">
          <Link
            href={accountLink}
            className={`${appBadgeCtaClass} !min-h-[38px] !min-w-[145px] !w-[145px] px-3 py-1.5 text-[14px]`}
          >
            <span className="relative z-10">{accountLabel}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={switchLanguage}
              className="flex h-9 items-center gap-1 rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-3 text-xs font-bold text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)]"
              aria-label={t('switchLanguage')}
              title={t('switchLanguage')}
            >
              <Languages className="h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)]"
              aria-label={!isDark ? t('darkMode') : t('lightMode')}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] p-2 text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--mindly-border)] bg-[var(--mindly-surface-glass)] px-5 pb-5 pt-3 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]'
                      : 'text-[var(--mindly-purple-muted)] hover:bg-[var(--mindly-primary-soft-3)] hover:text-[var(--mindly-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={switchLanguage}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-4 py-3 text-sm font-bold text-[var(--mindly-primary)]"
                aria-label={t('switchLanguage')}
              >
                <Languages className="h-4 w-4" />
                <span>{locale.toUpperCase()}</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-4 py-3 text-sm font-bold text-[var(--mindly-primary)]"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>{t('light')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>{t('dark')}</span>
                  </>
                )}
              </button>
            </div>

            <Link
              href={accountLink}
              onClick={() => setOpen(false)}
              className={`${appBadgeCtaClass} mt-2 min-w-0`}
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

