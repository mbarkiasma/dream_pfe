'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Languages, Menu, Moon, Sun, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { appBadgeCtaClass } from '@/components/ui/badge'
import { useTheme } from '@/providers/Theme'

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()
  const { lang, t, toggleLang } = useLanguage()
  const isDark = mounted && theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { label: t.navbar.accueil, href: '/' },
    { label: t.navbar.fonctionnalites, href: '/fonctionnalites' },
    { label: t.navbar.aPropos, href: '/a-propos' },
    { label: t.navbar.contact, href: '/contact' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <nav className="sticky top-0 z-[100] border-b border-[var(--mindly-border)] bg-[var(--mindly-surface-glass)] backdrop-blur-[18px]">
      <div className="relative mx-auto flex h-[70px] w-full max-w-none items-center justify-between px-5 lg:px-14">
        <Link href="/" className="flex flex-col lg:translate-x-4" onClick={() => setOpen(false)}>
          <span className="bg-gradient-to-r from-[#895EF8] to-[#A987FF] bg-clip-text font-[family-name:var(--font-zain)] text-[19px] font-bold leading-none text-transparent">
            MindBloom
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--mindly-purple-muted)]">
            {lang === 'fr' ? 'Bien-etre & IA' : 'Wellness & AI'}
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
            href="/login"
            className={`${appBadgeCtaClass} !min-h-[38px] !min-w-[145px] !w-[145px] px-3 py-1.5 text-[14px]`}
          >
            <span className="relative z-10">{t.navbar.login}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="flex h-9 items-center gap-1 rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-3 text-xs font-bold text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)]"
              aria-label={lang === 'fr' ? 'Changer la langue' : 'Change language'}
              title={t.navbar.switchLang}
            >
              <Languages className="h-4 w-4" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)]"
              aria-label={
                lang === 'fr'
                  ? !isDark
                    ? 'Activer le mode sombre'
                    : 'Activer le mode clair'
                  : !isDark
                    ? 'Enable dark mode'
                    : 'Enable light mode'
              }
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] p-2 text-[var(--mindly-primary)] transition hover:bg-[var(--mindly-surface)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={lang === 'fr' ? 'Menu' : 'Menu'}
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
                onClick={toggleLang}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-4 py-3 text-sm font-bold text-[var(--mindly-primary)]"
                aria-label={lang === 'fr' ? 'Changer la langue' : 'Change language'}
              >
                <Languages className="h-4 w-4" />
                <span>{lang.toUpperCase()}</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] px-4 py-3 text-sm font-bold text-[var(--mindly-primary)]"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>{lang === 'fr' ? 'Clair' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>{lang === 'fr' ? 'Sombre' : 'Dark'}</span>
                  </>
                )}
              </button>
            </div>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={`${appBadgeCtaClass} mt-2 min-w-0`}
            >
              {t.navbar.login}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

