'use client'

import {
  Activity,
  CheckSquare,
  CircleAlert,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

type ActorId = 'student' | 'coach' | 'psychologist'

const actorDescriptionClass =
  'font-[family-name:var(--font-zain)] text-[14.5px] font-normal leading-[1.6] tracking-normal'

const featureItemTextClass =
  'font-[family-name:var(--font-zain)] text-[14.5px] font-normal leading-[1.45] tracking-normal text-[var(--mindly-purple-muted)]'

const getActorCardClass = (isActive: boolean) =>
  `rounded-[22px] border p-5 text-left transition-all duration-300 ease-out hover:-translate-y-1 sm:p-6 ${
    isActive
      ? 'border-[var(--mindly-border-strong)] bg-[image:var(--mindly-actor-active-bg)] text-white shadow-[var(--mindly-actor-active-shadow)] hover:shadow-[var(--mindly-actor-active-shadow)]'
      : 'border-[var(--mindly-border)] bg-[var(--mindly-surface)] text-[var(--mindly-text-strong)] shadow-[var(--mindly-shadow-lg)] hover:shadow-[var(--mindly-shadow-xl)]'
  }`

const getActorIconClass = (isActive: boolean) =>
  `flex h-10 w-10 items-center justify-center rounded-[12px] border transition-all duration-300 ease-out ${
    isActive
      ? 'border-[var(--mindly-actor-chip-border)] bg-[var(--mindly-actor-chip-bg)] text-white'
      : 'border-transparent bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)]'
  }`

const getActorPillClass = (isActive: boolean) =>
  `rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase leading-none transition-all duration-300 ease-out ${
    isActive
      ? 'border border-[var(--mindly-actor-chip-border)] bg-[var(--mindly-actor-chip-bg)] text-white'
      : 'bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)]'
  }`

const getActorTitleClass = (isActive: boolean, sizeClass = 'text-[24px]') =>
  `${sizeClass} font-bold leading-none transition-colors duration-300 ease-out ${
    isActive ? 'text-white' : 'text-[var(--mindly-text-strong)]'
  }`

const getActorSubtitleClass = (isActive: boolean) =>
  `mt-2 text-[14px] font-normal leading-none transition-colors duration-300 ease-out ${
    isActive ? 'text-white/80' : 'text-[var(--mindly-purple-muted)]'
  }`

const getActorDescriptionClass = (isActive: boolean, extraClass = '') =>
  `${extraClass} ${actorDescriptionClass} transition-colors duration-300 ease-out ${
    isActive ? 'text-white/90' : 'text-[var(--mindly-purple-muted)]'
  }`

const actorFeatures: Record<
  ActorId,
  {
    title: string
    subtitle: string
    count: string
    items: { number: number; content: ReactNode }[]
  }
> = {
  student: {
    title: 'Espace Étudiant·e',
    subtitle: "Tout ce que l'étudiant peut faire dans MindBloom",
    count: '8 fonctionnalités',
    items: [
      {
        number: 1,
        content: (
          <>
            Passer l&apos;entretien <Highlight>Big Five</Highlight>
          </>
        ),
      },
      {
        number: 2,
        content: (
          <>
            Télécharger son <Highlight>analyse PDF</Highlight>
          </>
        ),
      },
      {
        number: 3,
        content: (
          <>
            Écrire et analyser <Highlight>ses rêves</Highlight>
          </>
        ),
      },
      {
        number: 4,
        content: (
          <>
            Voir la <Highlight>vidéo IA</Highlight> de son rêve
          </>
        ),
      },
      {
        number: 5,
        content: (
          <>
            Chatter avec un <Highlight>coach IA</Highlight> ou humain
          </>
        ),
      },
      {
        number: 6,
        content: (
          <>
            Prendre <Highlight>RDV</Highlight> chez un psychologue
          </>
        ),
      },
      {
        number: 7,
        content: (
          <>
            Suivre son <Highlight>évolution hebdomadaire</Highlight>
          </>
        ),
      },
      {
        number: 8,
        content: (
          <>
            Accéder à son <Highlight>journal personnel</Highlight>
          </>
        ),
      },
    ],
  },
  coach: {
    title: 'Espace Coach',
    subtitle: 'Tout ce que le coach peut faire dans MindBloom',
    count: '4 fonctionnalités',
    items: [
      {
        number: 1,
        content: (
          <>
            Suivre les <Highlight>étudiants</Highlight>
          </>
        ),
      },
      {
        number: 2,
        content: (
          <>
            Répondre aux <Highlight>messages sécurisés</Highlight>
          </>
        ),
      },
      {
        number: 3,
        content: (
          <>
            Planifier des <Highlight>séances de coaching</Highlight>
          </>
        ),
      },
      {
        number: 4,
        content: (
          <>
            Proposer des <Highlight>exercices personnalisés</Highlight>
          </>
        ),
      },
    ],
  },
  psychologist: {
    title: 'Espace Psychologue',
    subtitle: 'Tout ce que le psychologue peut faire dans MindBloom',
    count: '2 fonctionnalités',
    items: [
      {
        number: 1,
        content: (
          <>
            Accepter des <Highlight>rendez-vous</Highlight>
          </>
        ),
      },
      {
        number: 2,
        content: (
          <>
            Refuser <Highlight>rendez-vous</Highlight>
          </>
        ),
      },
    ],
  },
}

function Highlight({ children }: { children: ReactNode }) {
  return <span className="font-normal text-[var(--mindly-purple-muted)]">{children}</span>
}

function InfoBadge({
  children,
  variant = 'light',
}: {
  children: ReactNode
  variant?: 'light' | 'white'
}) {
  const styles = {
    light: 'border-[var(--mindly-border-violet)] bg-[var(--mindly-bg)] text-[var(--mindly-primary)]',
    white: 'border-[var(--mindly-actor-chip-border)] bg-[var(--mindly-actor-chip-bg)] text-white',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-[family-name:var(--font-zain)] text-[13px] font-bold leading-none transition-all duration-300 ease-out ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

export function ActeursFonctionnalites() {
  const [activeActor, setActiveActor] = useState<ActorId>('student')
  const currentFeatures = actorFeatures[activeActor]

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_12%,rgba(137,94,248,0.12),transparent_32%),radial-gradient(circle_at_84%_24%,rgba(169,135,255,0.16),transparent_34%),radial-gradient(circle_at_52%_92%,rgba(137,94,248,0.08),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1120px] font-[family-name:var(--font-zain)]">
        <div className="mb-10 text-left">
          <span className={sectionBadgeClass}>
            <span className={sectionBadgeDotClass} />
            Les acteurs de la plateforme
          </span>

          <h2 className="mt-4 text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--color-text-strong)] sm:text-[42px] lg:text-[48px]">
            Qui utilise{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary-violet)] to-[var(--color-primary-violet-light)] bg-clip-text text-transparent">
              MindBloom
            </span>{' '}
            ?
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
          <button
            type="button"
            onClick={() => setActiveActor('student')}
            className={`relative overflow-hidden ${getActorCardClass(activeActor === 'student')}`}
          >
            <div
              className={`pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full blur-2xl ${
                activeActor === 'student' ? 'bg-[var(--mindly-actor-chip-bg)]' : 'bg-[var(--mindly-primary-light)]/0'
              }`}
            />

            <div className="relative mb-4 flex items-start justify-between gap-3">
              <div
                className={getActorIconClass(activeActor === 'student')}
              >
                <GraduationCap className="h-4 w-4" />
              </div>
              <span
                className={getActorPillClass(activeActor === 'student')}
              >
                L&apos;ACTEUR PRINCIPAL
              </span>
            </div>

            <h3 className={`relative ${getActorTitleClass(activeActor === 'student', 'text-[26px]')}`}>
              Étudiant·e
            </h3>
            <p
              className={`relative ${getActorSubtitleClass(activeActor === 'student')}`}
            >
              Utilisateur central de la plateforme
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'student', 'relative mt-5 max-w-[500px]')}
            >
              Accède à un espace complet de bien-être mental : entretiens IA, journal de rêves,
              coaching et suivi personnalisé tout en un seul endroit sécurisé.
            </p>

            <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'student' ? 'white' : 'light'}>
                <Users className="h-3.5 w-3.5" />
                12 400+ utilisateurs
              </InfoBadge>
              <InfoBadge variant={activeActor === 'student' ? 'white' : 'light'}>
                <Activity className="h-3.5 w-3.5" />
                Actif
              </InfoBadge>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveActor('coach')}
            className={getActorCardClass(activeActor === 'coach')}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div
                className={getActorIconClass(activeActor === 'coach')}
              >
                <MessageCircle className="h-4 w-4" />
              </div>
              <span
                className={getActorPillClass(activeActor === 'coach')}
              >
                L&apos;ACCOMPAGNATEUR
              </span>
            </div>

            <h3 className={getActorTitleClass(activeActor === 'coach')}>Coach</h3>
            <p
              className={getActorSubtitleClass(activeActor === 'coach')}
            >
              Suivi actif et bienveillant
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'coach', 'mt-5')}
            >
              Suit les étudiants en difficulté, répond à leurs messages et propose des séances
              d&apos;accompagnement personnalisées.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'coach' ? 'white' : 'light'}>Humain ou IA</InfoBadge>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveActor('psychologist')}
            className={getActorCardClass(activeActor === 'psychologist')}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div
                className={getActorIconClass(activeActor === 'psychologist')}
              >
                <CircleAlert className="h-4 w-4" />
              </div>
              <span
                className={getActorPillClass(activeActor === 'psychologist')}
              >
                L&apos;EXPERT CLINIQUE
              </span>
            </div>

            <h3 className={getActorTitleClass(activeActor === 'psychologist')}>Psychologue</h3>
            <p
              className={getActorSubtitleClass(activeActor === 'psychologist')}
            >
              Intervention et suivi clinique
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'psychologist', 'mt-5')}
            >
              Reçoit les étudiants en état critique, gère les rendez-vous et accède aux analyses de
              personnalité partagées.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'psychologist' ? 'white' : 'light'}>Certifiés</InfoBadge>
              <InfoBadge variant={activeActor === 'psychologist' ? 'white' : 'light'}>
                <ShieldCheck className="h-3.5 w-3.5" />
                Agréé
              </InfoBadge>
            </div>
          </button>
        </div>

        <article className="mt-10 rounded-[22px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-5 shadow-[var(--mindly-shadow-lg)] sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--color-primary-violet-soft)] text-[var(--color-primary-violet)]">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[24px] font-bold leading-none text-[var(--mindly-text-strong)]">{currentFeatures.title}</h3>
                <p className="mt-2 font-[family-name:var(--font-zain)] text-[14.5px] font-normal leading-[1.6] tracking-normal text-[var(--mindly-purple-muted)]">
                  {currentFeatures.subtitle}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-bg)] px-5 py-2 font-[family-name:var(--font-zain)] text-[13px] font-bold leading-none text-[var(--mindly-primary)] transition-all duration-300 ease-out">
              <CheckSquare className="h-3.5 w-3.5 text-[var(--mindly-primary)]" />
              {currentFeatures.count}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {currentFeatures.items.map((item, index) => (
              <div
                key={item.number}
                className={`flex min-h-[58px] items-center gap-3 rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-bg)] px-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--mindly-border-strong)] hover:bg-[var(--mindly-bg-strong)] hover:shadow-[var(--mindly-shadow-sm)] ${
                  index >= 6 ? 'xl:col-span-2' : ''
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mindly-primary)] text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(137,94,248,0.24)]">
                  {item.number}
                </span>
                <span className={featureItemTextClass}>{item.content}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default ActeursFonctionnalites

