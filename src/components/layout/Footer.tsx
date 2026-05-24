'use client'

import { Heart, Lock } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Link } from '@/i18n/routing'

export function Footer() {
  const isFr = useLocale() !== 'en'
  const copy = isFr
    ? {
        tagline: 'Bien-etre & IA',
        description:
          "Plateforme de bien-etre mental propulsee par l'intelligence artificielle. Analyse Big Five, journal de reves, suivi quotidien et accompagnement personnalise.",
        privacy: 'Donnees chiffrees - Confidentialite garantie',
        navTitle: 'Navigation',
        resourcesTitle: 'Ressources',
        legalTitle: 'Legal',
        rights: 'Tous droits reserves',
        madeWith: 'Fait avec',
        madeFor: 'pour le bien-etre mental - Tunis, Tunisie',
      }
    : {
        tagline: 'Wellness & AI',
        description:
          'AI-powered mental wellness platform. Big Five analysis, dream journal, daily tracking, and personalized support.',
        privacy: 'Encrypted data - Guaranteed confidentiality',
        navTitle: 'Navigation',
        resourcesTitle: 'Resources',
        legalTitle: 'Legal',
        rights: 'All rights reserved',
        madeWith: 'Made with',
        madeFor: 'for mental wellness - Tunis, Tunisia',
      }

  const nav = isFr
    ? [
        { label: 'Accueil', href: '/' },
        { label: 'Fonctionnalites', href: '/fonctionnalites' },
        { label: 'A propos', href: '/a-propos' },
        { label: 'Contact', href: '/contact' },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/fonctionnalites' },
        { label: 'About', href: '/a-propos' },
        { label: 'Contact', href: '/contact' },
      ]

  const ressources = isFr
    ? [
        { label: 'Modele Big Five', href: '/fonctionnalites' },
        { label: 'Journal de reves', href: '/fonctionnalites' },
        { label: 'Suivi quotidien', href: '/fonctionnalites' },
        { label: 'Entretien IA', href: '/login' },
      ]
    : [
        { label: 'Big Five model', href: '/fonctionnalites' },
        { label: 'Dream journal', href: '/fonctionnalites' },
        { label: 'Daily tracking', href: '/fonctionnalites' },
        { label: 'AI interview', href: '/login' },
      ]

  const legal = isFr
    ? [
        { label: 'Confidentialite', href: '#' },
        { label: "Conditions d'utilisation", href: '#' },
        { label: 'Mentions legales', href: '#' },
        { label: 'Cookies', href: '#' },
      ]
    : [
        { label: 'Privacy', href: '#' },
        { label: 'Terms of use', href: '#' },
        { label: 'Legal notice', href: '#' },
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
                {copy.tagline}
              </p>
            </div>
            <p className="max-w-xs text-sm font-medium leading-[1.7] tracking-normal text-[var(--mindly-primary-light)]">
              {copy.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mindly-lavender-300)] text-[10px]">
                <Lock className="h-3 w-3 text-[var(--mindly-primary-light)]" />
              </span>
              <span className="text-[12px] font-bold leading-[1.35] text-[var(--mindly-primary-light)]">
                {copy.privacy}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">
              {copy.navTitle}
            </p>
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
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">
              {copy.resourcesTitle}
            </p>
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
            <p className="text-[15px] font-bold leading-[1.35] tracking-normal text-[var(--mindly-primary-light)]">
              {copy.legalTitle}
            </p>
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
            (c) 2025 MindBloom - {copy.rights}
          </p>
          <p className="text-[11px] text-[var(--mindly-primary-light)]">
            {copy.madeWith}{' '}
            <Heart className="mx-1 inline h-3.5 w-3.5 text-[var(--mindly-primary-light)]" />{' '}
            {copy.madeFor}
          </p>
        </div>
      </div>
    </footer>
  )
}
