'use client'

import Link from 'next/link'
import { Heart, Lock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { lang } = useLanguage()
  const isFr = lang === 'fr'

  const nav = [
    { label: isFr ? 'Accueil' : 'Home', href: '/' },
    { label: isFr ? 'Fonctionnalites' : 'Features', href: '/fonctionnalites' },
    { label: isFr ? 'A propos' : 'About', href: '/a-propos' },
    { label: isFr ? 'Contact' : 'Contact', href: '/contact' },
  ]

  const ressources = [
    { label: isFr ? 'Modele Big Five' : 'Big Five model', href: '/fonctionnalites' },
    { label: isFr ? 'Journal de reves' : 'Dream journal', href: '/fonctionnalites' },
    { label: isFr ? 'Suivi quotidien' : 'Daily tracking', href: '/fonctionnalites' },
    { label: isFr ? 'Entretien IA' : 'AI interview', href: '/login' },
  ]

  const legal = [
    { label: isFr ? 'Confidentialite' : 'Privacy', href: '#' },
    { label: isFr ? "Conditions d'utilisation" : 'Terms of use', href: '#' },
    { label: isFr ? 'Mentions legales' : 'Legal notice', href: '#' },
    { label: 'Cookies', href: '#' },
  ]

  return (
    <footer className="border-t border-[var(--mindly-lavender-700)]/35 bg-[var(--mindly-bg)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="space-y-4 sm:col-span-2 lg:col-span-1 lg:-translate-x-8">
            <div>
              <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text text-xl font-extrabold text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                MindBloom
              </span>
              <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[var(--mindly-primary-light)]">
                {isFr ? 'Bien-etre & IA' : 'Wellness & AI'}
              </p>
            </div>
            <p className="max-w-xs text-sm font-medium leading-[1.7] tracking-normal text-[var(--mindly-primary-light)]">
              {isFr
                ? "Plateforme de bien-etre mental propulsee par l'intelligence artificielle. Analyse Big Five, journal de reves, suivi quotidien et accompagnement personnalise."
                : 'AI-powered mental wellness platform. Big Five analysis, dream journal, daily tracking, and personalized support.'}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mindly-lavender-300)] text-[10px]">
                <Lock className="h-3 w-3 text-[var(--mindly-primary-light)]" />
              </span>
              <span className="text-[12px] font-bold leading-[1.35] text-[var(--mindly-primary-light)]">{isFr ? 'Donnees chiffrees · Confidentialite garantie' : 'Encrypted data · Guaranteed confidentiality'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">{isFr ? 'Navigation' : 'Navigation'}</p>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[var(--mindly-primary-light)] transition hover:text-[var(--mindly-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">{isFr ? 'Ressources' : 'Resources'}</p>
            <ul className="space-y-2.5">
              {ressources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[var(--mindly-primary-light)] transition hover:text-[var(--mindly-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">{isFr ? 'Legal' : 'Legal'}</p>
            <ul className="space-y-2.5">
              {legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[var(--mindly-primary-light)] transition hover:text-[var(--mindly-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--mindly-lavender-700)]/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row">
          <p className="text-[11px] text-[var(--mindly-primary-light)]">
            © 2025 MindBloom — {isFr ? 'Tous droits reserves' : 'All rights reserved'}
          </p>
          <p className="text-[11px] text-[var(--mindly-primary-light)]">
            {isFr ? 'Fait avec' : 'Made with'} <Heart className="mx-1 inline h-3.5 w-3.5 text-[var(--mindly-primary-light)]" /> {isFr ? 'pour le bien-etre mental · Tunis, Tunisie' : 'for mental wellness · Tunis, Tunisia'}
          </p>
        </div>
      </div>
    </footer>
  )
}


