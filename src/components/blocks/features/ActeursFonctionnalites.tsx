'use client'

import {
  Activity,
  CheckSquare,
  CircleAlert,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

type ActorId = 'student' | 'coach' | 'psychologist'

const actorDescriptionClass =
  'font-[family-name:var(--font-zain)] text-[14.5px] font-normal leading-[1.6] tracking-normal'

const featureItemTextClass =
  'font-[family-name:var(--font-zain)] text-[15.5px] font-semibold leading-[1.35] tracking-normal text-[var(--mindly-text-strong)]'

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
    title: 'Espace Étudiant',
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
  return <span className="font-inherit text-[var(--mindly-text-strong)]">{children}</span>
}

const actorFeaturesEn: typeof actorFeatures = {
  student: {
    title: 'Student space',
    subtitle: 'Everything students can do in MindBloom',
    count: '8 features',
    items: [
      { number: 1, content: <>Take the <Highlight>Big Five</Highlight> interview</> },
      { number: 2, content: <>Download the <Highlight>PDF analysis</Highlight></> },
      { number: 3, content: <>Write and analyze <Highlight>dreams</Highlight></> },
      { number: 4, content: <>Watch the <Highlight>AI video</Highlight> of a dream</> },
      { number: 5, content: <>Chat with an <Highlight>AI coach</Highlight> or a human coach</> },
      { number: 6, content: <>Book a <Highlight>psychologist appointment</Highlight></> },
      { number: 7, content: <>Track <Highlight>weekly progress</Highlight></> },
      { number: 8, content: <>Access a <Highlight>personal journal</Highlight></> },
    ],
  },
  coach: {
    title: 'Coach space',
    subtitle: 'Everything coaches can do in MindBloom',
    count: '4 features',
    items: [
      { number: 1, content: <>Follow <Highlight>students</Highlight></> },
      { number: 2, content: <>Reply to <Highlight>secure messages</Highlight></> },
      { number: 3, content: <>Schedule <Highlight>coaching sessions</Highlight></> },
      { number: 4, content: <>Suggest <Highlight>personalized exercises</Highlight></> },
    ],
  },
  psychologist: {
    title: 'Psychologist space',
    subtitle: 'Everything psychologists can do in MindBloom',
    count: '2 features',
    items: [
      { number: 1, content: <>Accept <Highlight>appointments</Highlight></> },
      { number: 2, content: <>Decline <Highlight>appointments</Highlight></> },
    ],
  },
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
  const isFr = useLocale() !== 'en'
  const [activeActor, setActiveActor] = useState<ActorId>('student')
  const currentFeatures = (isFr ? actorFeatures : actorFeaturesEn)[activeActor]
  const copy = isFr
    ? {
        badge: 'Les acteurs de la plateforme',
        headingPrefix: 'Qui utilise',
        mainActor: "L'ACTEUR PRINCIPAL",
        studentTitle: 'Etudiant',
        studentSubtitle: 'Utilisateur central de la plateforme',
        studentDescription:
          "Accede a un espace complet de bien-etre mental : entretiens IA, journal de reves, coaching et suivi personnalise tout en un seul endroit securise.",
        users: '12 400+ utilisateurs',
        active: 'Actif',
        coachPill: "L'ACCOMPAGNATEUR",
        coachSubtitle: 'Suivi actif et bienveillant',
        coachDescription:
          "Suit les etudiants en difficulte, repond a leurs messages et propose des seances d'accompagnement personnalisees.",
        coachBadge: 'Humain ou IA',
        psychologistPill: "L'EXPERT CLINIQUE",
        psychologistTitle: 'Psychologue',
        psychologistSubtitle: 'Intervention et suivi clinique',
        psychologistDescription:
          'Recoit les etudiants en etat critique, gere les rendez-vous et accede aux analyses de personnalite partagees.',
        psychologistBadge: 'Certifies',
      }
    : {
        badge: 'Platform users',
        headingPrefix: 'Who uses',
        mainActor: 'MAIN USER',
        studentTitle: 'Student',
        studentSubtitle: 'Core user of the platform',
        studentDescription:
          'Access a complete mental well-being space: AI interviews, dream journal, coaching and personalized tracking in one secure place.',
        users: '12,400+ users',
        active: 'Active',
        coachPill: 'SUPPORT GUIDE',
        coachSubtitle: 'Active and caring follow-up',
        coachDescription:
          'Follows students in difficulty, replies to their messages and offers personalized support sessions.',
        coachBadge: 'Human or AI',
        psychologistPill: 'CLINICAL EXPERT',
        psychologistTitle: 'Psychologist',
        psychologistSubtitle: 'Clinical intervention and follow-up',
        psychologistDescription:
          'Receives students in critical situations, manages appointments and accesses shared personality analyses.',
        psychologistBadge: 'Certified',
      }

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_12%,rgba(137,94,248,0.12),transparent_32%),radial-gradient(circle_at_84%_24%,rgba(169,135,255,0.16),transparent_34%),radial-gradient(circle_at_52%_92%,rgba(137,94,248,0.08),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1120px] font-[family-name:var(--font-zain)]">
        <div className="mb-10 text-left">
          <span className={sectionBadgeClass}>
            <span className={sectionBadgeDotClass} />
            {copy.badge}
          </span>

          <h2 className="mt-4 text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--color-text-strong)] sm:text-[42px] lg:text-[48px]">
            {copy.headingPrefix}{' '}
            <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text text-transparent">
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
                {copy.mainActor}
              </span>
            </div>

            <h3 className={`relative ${getActorTitleClass(activeActor === 'student', 'text-[26px]')}`}>
              {copy.studentTitle}
            </h3>
            <p
              className={`relative ${getActorSubtitleClass(activeActor === 'student')}`}
            >
              {copy.studentSubtitle}
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'student', 'relative mt-5 max-w-[500px]')}
            >
              {copy.studentDescription}
            </p>

            <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'student' ? 'white' : 'light'}>
                <Users className="h-3.5 w-3.5" />
                {copy.users}
              </InfoBadge>
              <InfoBadge variant={activeActor === 'student' ? 'white' : 'light'}>
                <Activity className="h-3.5 w-3.5" />
                {copy.active}
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
                {copy.coachPill}
              </span>
            </div>

            <h3 className={getActorTitleClass(activeActor === 'coach')}>Coach</h3>
            <p
              className={getActorSubtitleClass(activeActor === 'coach')}
            >
              {copy.coachSubtitle}
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'coach', 'mt-5')}
            >
              {copy.coachDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'coach' ? 'white' : 'light'}>{copy.coachBadge}</InfoBadge>
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
                {copy.psychologistPill}
              </span>
            </div>

            <h3 className={getActorTitleClass(activeActor === 'psychologist')}>{copy.psychologistTitle}</h3>
            <p
              className={getActorSubtitleClass(activeActor === 'psychologist')}
            >
              {copy.psychologistSubtitle}
            </p>

            <p
              className={getActorDescriptionClass(activeActor === 'psychologist', 'mt-5')}
            >
              {copy.psychologistDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <InfoBadge variant={activeActor === 'psychologist' ? 'white' : 'light'}>{copy.psychologistBadge}</InfoBadge>
            </div>
          </button>
        </div>

        <article className="relative mt-10 overflow-hidden rounded-[24px] border border-[var(--mindly-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,255,0.88))] p-5 shadow-[var(--mindly-shadow-lg)] sm:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(137,94,248,0.38),transparent)]" />

          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)] shadow-[0_10px_24px_rgba(137,94,248,0.12)]">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[24px] font-bold leading-tight text-[var(--mindly-text-strong)]">{currentFeatures.title}</h3>
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {currentFeatures.items.map((item) => (
              <div
                key={item.number}
                className="group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-[18px] border border-[var(--mindly-border-violet)] bg-white p-4 text-left shadow-[0_10px_26px_rgba(137,94,248,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--mindly-border-strong)] hover:shadow-[0_18px_34px_rgba(137,94,248,0.14)]"
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--mindly-primary-soft-3)] opacity-70 transition-transform duration-300 ease-out group-hover:scale-125" />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--mindly-gradient-primary)] text-[16px] font-bold text-white shadow-[0_10px_22px_rgba(137,94,248,0.26)]">
                  {item.number}
                </span>
                <span className={`relative mt-4 block ${featureItemTextClass}`}>{item.content}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default ActeursFonctionnalites

