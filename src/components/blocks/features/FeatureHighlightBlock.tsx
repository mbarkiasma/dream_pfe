'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  Bot,
  Brain,
  CalendarCheck,
  Download,
  FileText,
  HeartPulse,
  Lock,
  MessageCircle,
  Moon,
  Sparkles,
  UserRoundCheck,
  Video,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

type FeatureCard = {
  number: string
  title: string
  tagline: string
  icon: ReactNode
  footer: string
  featured?: boolean
  subs: {
    icon: ReactNode
    title: string
    description: string
  }[]
}

const featuresFr: FeatureCard[] = [
  {
    number: '01',
    title: 'Entretien Big Five',
    tagline: "Connais-toi toi-même grâce à l'IA",
    icon: <Brain className="h-5 w-5" />,
    footer: 'IA · PDF',
    subs: [
      {
        icon: <Bot className="h-4 w-4" />,
        title: 'Entretien IA adaptatif',
        description: 'Un échange guidé qui ajuste ses questions à ton profil.',
      },
      {
        icon: <FileText className="h-4 w-4" />,
        title: 'Rapport de personnalité',
        description: 'Une synthèse claire de tes traits et besoins.',
      },
      {
        icon: <Download className="h-4 w-4" />,
        title: 'Export PDF',
        description: 'Un document propre, prêt à consulter ou partager.',
      },
    ],
  },
  {
    number: '02',
    title: 'Journal de rêves',
    tagline: 'Explore ton inconscient chaque nuit',
    icon: <Moon className="h-5 w-5" />,
    footer: 'IA · Vidéo',
    subs: [
      {
        icon: <FileText className="h-4 w-4" />,
        title: 'Écris ton rêve',
        description: 'Capture les détails importants dès le réveil.',
      },
      {
        icon: <Sparkles className="h-4 w-4" />,
        title: 'Analyse symbolique',
        description: 'Repère les émotions et symboles récurrents.',
      },
      {
        icon: <Video className="h-4 w-4" />,
        title: 'Vidéo illustrée',
        description: 'Transforme ton rêve en récit visuel généré par IA.',
      },
    ],
  },
  {
    number: '03',
    title: 'Chat avec un coach',
    tagline: 'Un soutien humain ou IA quand tu en as besoin',
    icon: <MessageCircle className="h-5 w-5" />,
    footer: 'Humain · IA',
    subs: [
      {
        icon: <Bot className="h-4 w-4" />,
        title: 'Smart Coach IA',
        description: 'Des réponses rapides pour traverser les moments difficiles.',
      },
      {
        icon: <UserRoundCheck className="h-4 w-4" />,
        title: 'Coach humain certifié',
        description: 'Un accompagnement bienveillant quand tu veux parler.',
      },
      {
        icon: <Lock className="h-4 w-4" />,
        title: '100% confidentiel',
        description: 'Tes échanges restent protégés et privés.',
      },
    ],
  },
  {
    number: '04',
    title: 'RDV Psychologue',
    tagline: 'Une aide prioritaire quand la situation devient critique',
    icon: <HeartPulse className="h-5 w-5" />,
    footer: 'Prioritaire',
    subs: [
      {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Détection de crise',
        description: "Les signaux d'alerte sont mieux identifiés.",
      },
      {
        icon: <CalendarCheck className="h-4 w-4" />,
        title: 'Prise de RDV',
        description: 'Des créneaux pour obtenir une aide rapidement.',
      },
      {
        icon: <HeartPulse className="h-4 w-4" />,
        title: 'Suivi post-consultation',
        description: 'Une continuité après le rendez-vous psychologique.',
      },
    ],
  },
]

const featuresEn: FeatureCard[] = [
  {
    number: '01',
    title: 'Big Five interview',
    tagline: 'Know yourself better with AI',
    icon: <Brain className="h-5 w-5" />,
    footer: 'AI - PDF',
    subs: [
      {
        icon: <Bot className="h-4 w-4" />,
        title: 'Adaptive AI interview',
        description: 'A guided exchange that adjusts questions to your profile.',
      },
      {
        icon: <FileText className="h-4 w-4" />,
        title: 'Personality report',
        description: 'A clear summary of your traits and needs.',
      },
      {
        icon: <Download className="h-4 w-4" />,
        title: 'PDF export',
        description: 'A clean document ready to review or share.',
      },
    ],
  },
  {
    number: '02',
    title: 'Dream journal',
    tagline: 'Explore your inner world each night',
    icon: <Moon className="h-5 w-5" />,
    footer: 'AI - Video',
    subs: [
      {
        icon: <FileText className="h-4 w-4" />,
        title: 'Write your dream',
        description: 'Capture important details as soon as you wake up.',
      },
      {
        icon: <Sparkles className="h-4 w-4" />,
        title: 'Symbolic analysis',
        description: 'Identify recurring emotions and symbols.',
      },
      {
        icon: <Video className="h-4 w-4" />,
        title: 'Illustrated video',
        description: 'Turn your dream into an AI-generated visual story.',
      },
    ],
  },
  {
    number: '03',
    title: 'Chat with a coach',
    tagline: 'Human or AI support when you need it',
    icon: <MessageCircle className="h-5 w-5" />,
    footer: 'Human - AI',
    subs: [
      {
        icon: <Bot className="h-4 w-4" />,
        title: 'Smart AI coach',
        description: 'Quick answers to help you through difficult moments.',
      },
      {
        icon: <UserRoundCheck className="h-4 w-4" />,
        title: 'Certified human coach',
        description: 'Kind support when you want to talk.',
      },
      {
        icon: <Lock className="h-4 w-4" />,
        title: '100% confidential',
        description: 'Your exchanges remain protected and private.',
      },
    ],
  },
  {
    number: '04',
    title: 'Psychologist appointment',
    tagline: 'Priority help when the situation becomes critical',
    icon: <HeartPulse className="h-5 w-5" />,
    footer: 'Priority',
    subs: [
      {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Crisis detection',
        description: 'Warning signs are identified more clearly.',
      },
      {
        icon: <CalendarCheck className="h-4 w-4" />,
        title: 'Appointment booking',
        description: 'Slots to get help quickly.',
      },
      {
        icon: <HeartPulse className="h-4 w-4" />,
        title: 'Post-consultation follow-up',
        description: 'Continuity after the psychological appointment.',
      },
    ],
  },
]

function IconBubble({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300 ease-out group-hover:scale-[1.08] group-hover:bg-[var(--mindly-lavender-300)] ${
        featured ? 'bg-white/16 text-white' : 'bg-[var(--mindly-bg-lavender)] text-[var(--mindly-primary)]'
      }`}
    >
      {children}
    </span>
  )
}

export default function FeatureHighlightBlock() {
  const isFr = useLocale() !== 'en'
  const features = isFr ? featuresFr : featuresEn
  const shouldReduceMotion = useReducedMotion()
  const smoothEase = [0.22, 1, 0.36, 1] as const

  const fadeDownInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }
  const fadeUpTitleInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const fadeUpDescriptionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }
  const cardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96 }
  const cardAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
  const innerInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const innerAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <div className="relative z-10 mx-auto max-w-[1200px] font-[family-name:var(--font-zain)]">
        <div className="mb-12 text-left">
          <motion.span
            className={sectionBadgeClass}
            initial={fadeDownInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, ease: smoothEase }}
          >
            <span className={sectionBadgeDotClass} />
            {isFr ? 'Espace etudiant' : 'Student space'}
          </motion.span>

          <motion.h2
            className="mt-4 text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text-dark)] sm:text-[42px] lg:text-[48px]"
            initial={fadeUpTitleInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.08, ease: smoothEase }}
          >
            {isFr ? '4 fonctionnalites pensees pour toi' : '4 features designed for you'}
          </motion.h2>

          <motion.p
            className="mt-4 max-w-[1080px] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)] lg:whitespace-nowrap"
            initial={fadeUpDescriptionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.16, ease: smoothEase }}
          >
            {isFr
              ? "De l'analyse de personnalite a la prise en charge urgente, MindBloom couvre chaque etape de ton bien-etre."
              : 'From personality analysis to urgent support, MindBloom covers every step of your well-being.'}
          </motion.p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.article
              key={feature.number}
              className={`group relative flex flex-col overflow-hidden rounded-[24px] p-6 transition-all duration-300 ease-out hover:-translate-y-[6px] hover:border-[var(--mindly-primary)] hover:shadow-[0_30px_76px_rgba(74,35,176,0.34)] ${
                'border border-[var(--mindly-primary-soft)]/70 bg-white/90 text-[var(--mindly-text-dark)] shadow-[0_22px_58px_rgba(74,35,176,0.12)]'
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
              initial={cardInitial}
              whileInView={cardAnimate}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : index * 0.1, ease: smoothEase }}
            >
              <div className="pointer-events-none absolute inset-x-4 -top-14 h-32 rounded-full bg-[var(--mindly-primary)]/0 blur-2xl transition-all duration-500 group-hover:bg-[var(--mindly-primary)]/38" />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -right-16 top-8 h-36 w-36 rounded-full bg-[var(--mindly-primary)]/32 blur-3xl" />
                <div className="absolute -left-14 bottom-8 h-32 w-32 rounded-full bg-[var(--mindly-primary-deep)]/24 blur-3xl" />
              </div>

              <motion.div
                className="relative mb-7 flex items-center justify-between"
                initial={innerInitial}
                whileInView={innerAnimate}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.12, ease: smoothEase }}
              >
                <span className="text-[21px] font-bold leading-none text-[var(--mindly-primary)]">
                  {feature.number}
                </span>

                <IconBubble>{feature.icon}</IconBubble>
              </motion.div>

              <motion.h3
                className="relative text-[28px] font-bold leading-[1.05] tracking-[-0.015em]"
                initial={innerInitial}
                whileInView={innerAnimate}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.2, ease: smoothEase }}
              >
                {feature.title}
              </motion.h3>

              <motion.p
                className="relative mt-3 min-h-[52px] text-[16px] font-bold leading-[1.45] text-[var(--mindly-text-strong)]"
                initial={innerInitial}
                whileInView={innerAnimate}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.24, ease: smoothEase }}
              >
                {feature.tagline}
              </motion.p>

              <motion.div
                className="relative mt-6 grid gap-4"
                initial={innerInitial}
                whileInView={innerAnimate}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.28, ease: smoothEase }}
              >
                {feature.subs.map((sub, subIndex) => (
                  <motion.div
                    key={sub.title}
                    className="flex items-start gap-3"
                    initial={innerInitial}
                    whileInView={innerAnimate}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{
                      duration: 0.35,
                      delay: shouldReduceMotion ? 0 : index * 0.1 + 0.3 + subIndex * 0.04,
                      ease: smoothEase,
                    }}
                  >
                    <IconBubble>{sub.icon}</IconBubble>
                    <div>
                      <p className="text-[16px] font-bold leading-tight text-[var(--mindly-text-dark)]">
                        {sub.title}
                      </p>
                      <p className="mt-1 text-[14px] font-normal leading-[1.65] text-[var(--mindly-purple-muted)]">
                        {sub.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="relative mt-auto flex items-center pt-7"
                initial={innerInitial}
                whileInView={innerAnimate}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.32, ease: smoothEase }}
              >
                <motion.span
                  className="rounded-full border border-[var(--mindly-primary-soft)] bg-[var(--mindly-lavender-200)] px-3.5 py-2 text-[13px] font-bold leading-none text-[var(--mindly-primary)]"
                  initial={innerInitial}
                  whileInView={innerAnimate}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.32, ease: smoothEase }}
                >
                  {feature.footer}
                </motion.span>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

