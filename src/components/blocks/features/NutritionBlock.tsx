'use client'

import { useState } from 'react'
import {
  Clock3,
  Heart,
  Moon,
  Target,
  UsersRound,
  Wind,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import RapportFAQFonctionnalites from './RapportFAQFonctionnalites'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

const cardsFr = [
  {
    title: 'Respiration guidée',
    description:
      'Lance des exercices courts pour revenir au calme avant un examen, un cours ou un rendez-vous.',
    tag: 'APAISANT',
    Icon: Wind,
  },
  {
    title: 'Gestion du temps',
    description:
      'Organise ton emploi du temps, définis tes priorités et évite la procrastination grâce à un suivi intelligent.',
    tag: 'PRODUCTIVITÉ',
    Icon: Clock3,
  },
  {
    title: 'Relations sociales',
    description:
      'Développe des liens sains avec tes camarades et ta famille pour renforcer ton réseau de soutien.',
    tag: 'SOCIAL',
    Icon: UsersRound,
  },
  {
    title: 'Gestion du stress',
    description:
      'Identifie tes sources de stress, suis ton état émotionnel et observe ton évolution grâce à des visualisations claires.',
    tag: 'QUOTIDIEN',
    Icon: Heart,
    featured: true,
  },
  {
    title: 'Sommeil & récupération',
    description:
      'Analyse la qualité de ton sommeil et reçois des conseils pour améliorer ta récupération physique.',
    tag: 'ANALYSE IA',
    Icon: Moon,
  },
  {
    title: 'Objectifs bien-être',
    description:
      'Fixe des objectifs simples et atteignables pour avancer progressivement sans pression inutile.',
    tag: 'PROGRESSION',
    Icon: Target,
  },
]

const cardsEn: typeof cardsFr = [
  {
    title: 'Guided breathing',
    description: 'Start short exercises to calm down before an exam, a class or an appointment.',
    tag: 'CALMING',
    Icon: Wind,
  },
  {
    title: 'Time management',
    description:
      'Organize your schedule, define priorities and avoid procrastination with intelligent tracking.',
    tag: 'PRODUCTIVITY',
    Icon: Clock3,
  },
  {
    title: 'Social relationships',
    description:
      'Build healthy connections with classmates and family to strengthen your support network.',
    tag: 'SOCIAL',
    Icon: UsersRound,
  },
  {
    title: 'Stress management',
    description:
      'Identify your stress sources, track your emotional state and see your progress through clear visualizations.',
    tag: 'DAILY',
    Icon: Heart,
    featured: true,
  },
  {
    title: 'Sleep & recovery',
    description: 'Analyze your sleep quality and receive guidance to improve physical recovery.',
    tag: 'AI ANALYSIS',
    Icon: Moon,
  },
  {
    title: 'Well-being goals',
    description: 'Set simple, achievable goals and move forward gradually without unnecessary pressure.',
    tag: 'PROGRESS',
    Icon: Target,
  },
]

export default function NutritionBlock() {
  const isFr = useLocale() !== 'en'
  const cards = isFr ? cardsFr : cardsEn
  const [activeCard, setActiveCard] = useState(3)

  return (
    <>
      <RapportFAQFonctionnalites />
      <section className="relative overflow-hidden bg-transparent px-0 py-14 font-[family-name:var(--font-zain)]">
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_22%_14%,rgba(137,94,248,0.14),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(169,135,255,0.22),transparent_34%),radial-gradient(circle_at_46%_86%,rgba(137,94,248,0.10),transparent_36%)]" />
        <div className="pointer-events-none absolute left-[-120px] top-24 hidden h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(137,94,248,0.16),transparent_68%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-160px] top-10 hidden h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(169,135,255,0.20),transparent_68%)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <div className="mb-10">
            <span className={sectionBadgeClass}>
              <span className={sectionBadgeDotClass} />
              {isFr ? 'Bien-etre global' : 'Global well-being'}
            </span>

            <h2 className="mt-4 text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text-dark)] sm:text-[42px] lg:text-[48px] xl:text-[52px]">
              {isFr ? 'Corps et esprit, en equilibre' : 'Body and mind in balance'}
            </h2>

            <p className="mt-4 max-w-[720px] font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)]">
              {isFr ? (
                <>
                  MindBloom prend soin de toutes les dimensions de ton bien-etre :{' '}
                  <span className="font-normal text-[var(--mindly-purple-muted)]">gestion du stress</span>, sommeil et objectifs bien-etre.
                </>
              ) : (
                <>
                  MindBloom supports every dimension of your well-being:{' '}
                  <span className="font-normal text-[var(--mindly-purple-muted)]">stress management</span>, sleep and personal goals.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-10 xl:grid-cols-6">
          {cards.map(({ title, description, tag, Icon }, index) => {
            const active = activeCard === index

            return (
            <button
              key={title}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveCard(index)}
              className={`flex min-h-[240px] flex-col rounded-[20px] p-5 text-left shadow-[0_14px_34px_rgba(137,94,248,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(137,94,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mindly-primary-light)] ${
                active
                  ? 'border border-transparent bg-[image:var(--mindly-gradient-primary)] text-white'
                  : 'border border-[var(--mindly-border)] bg-[var(--mindly-surface)] text-[var(--mindly-text-dark)]'
              }`}
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] ${
                  active ? 'bg-white/16 text-white' : 'bg-[var(--mindly-bg-lavender)] text-[var(--mindly-primary)]'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-[20px] font-bold leading-tight">{title}</h3>
              <p
                className={`mt-3 min-h-[86px] text-[14.5px] font-normal leading-[1.55] ${
                  active ? 'text-white/88' : 'text-[var(--mindly-purple-muted)]'
                }`}
              >
                {description}
              </p>

              <span
                className={`mt-auto inline-flex min-h-9 w-fit max-w-full items-center justify-center rounded-full border px-4 py-2 text-center text-[12px] font-bold leading-[1.1] ${
                  active
                    ? 'border-white/35 bg-white/12 text-white'
                    : 'border-[var(--mindly-primary-soft)] bg-[var(--mindly-lavender-50)] text-[var(--mindly-primary)]'
                }`}
              >
                {tag}
              </span>
            </button>
            )
          })}
        </div>
      </section>
    </>
  )
}

