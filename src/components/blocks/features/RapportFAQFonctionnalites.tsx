'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Brain,
  ClipboardCheck,
  Heart,
  Lock,
  Plus,
  ShieldQuestion,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

const reportTraitsFr = [
  {
    label: 'Ouverture',
    description: 'Curiosite intellectuelle, creativite et gout pour la nouveaute.',
    level: 'Tres eleve',
    score: 82,
    Icon: Brain,
  },
  {
    label: 'Conscience',
    description: "Organisation, discipline et fiabilite dans l'action.",
    level: 'Eleve',
    score: 74,
    Icon: ClipboardCheck,
  },
  {
    label: 'Extraversion',
    description: 'Sociabilite, energie et aisance dans les interactions.',
    level: 'Modere',
    score: 61,
    Icon: Sparkles,
  },
  {
    label: 'Agreabilite',
    description: 'Altruisme, cooperation et confiance envers autrui.',
    level: 'Eleve',
    score: 78,
    Icon: Heart,
  },
  {
    label: 'Neurotisme',
    description: 'Tendance a ressentir des emotions negatives et du stress.',
    level: 'Stable',
    score: 43,
    Icon: Zap,
  },
]

const reportTraitsEn: typeof reportTraitsFr = [
  {
    label: 'Openness',
    description: 'Intellectual curiosity, creativity and appetite for novelty.',
    level: 'Very high',
    score: 82,
    Icon: Brain,
  },
  {
    label: 'Conscientiousness',
    description: 'Organization, discipline and reliability in action.',
    level: 'High',
    score: 74,
    Icon: ClipboardCheck,
  },
  {
    label: 'Extraversion',
    description: 'Sociability, energy and ease in interactions.',
    level: 'Moderate',
    score: 61,
    Icon: Sparkles,
  },
  {
    label: 'Agreeableness',
    description: 'Altruism, cooperation and trust toward others.',
    level: 'High',
    score: 78,
    Icon: Heart,
  },
  {
    label: 'Neuroticism',
    description: 'Tendency to experience negative emotions and stress.',
    level: 'Stable',
    score: 43,
    Icon: Zap,
  },
]

const faqItemsFr = [
  {
    question: "Comment se deroule l'entretien intelligent ?",
    answer:
      "L'etudiant repond a des questions guidees, puis MindBloom synthetise les signaux utiles pour proposer un accompagnement adapte.",
  },
  {
    question: "A quoi sert l'analyse Big Five ?",
    answer:
      'Elle aide a mieux comprendre les traits dominants, les besoins emotionnels et les leviers de motivation de chaque etudiant.',
  },
  {
    question: "Comment fonctionne l'analyse des reves ?",
    answer:
      'MindBloom transforme les notes de reve en resume clair, puis identifie les emotions et themes recurrents.',
  },
  {
    question: 'Est-ce que les donnees sont confidentielles ?',
    answer:
      'Oui. Les echanges, rapports et informations personnelles restent prives et proteges par les protocoles de securite de la plateforme.',
  },
  {
    question: 'Quand intervient un coach ou un psychologue ?',
    answer:
      "Un specialiste peut prendre le relais quand l'etudiant demande un soutien humain ou lorsqu'un besoin prioritaire est detecte.",
  },
]

const faqItemsEn: typeof faqItemsFr = [
  {
    question: 'How does the intelligent interview work?',
    answer:
      'The student answers guided questions, then MindBloom summarizes useful signals to suggest adapted support.',
  },
  {
    question: 'What is the Big Five analysis for?',
    answer:
      'It helps better understand dominant traits, emotional needs and motivation levers for each student.',
  },
  {
    question: 'How does dream analysis work?',
    answer:
      'MindBloom turns dream notes into a clear summary, then identifies recurring emotions and themes.',
  },
  {
    question: 'Is the data confidential?',
    answer:
      'Yes. Exchanges, reports and personal information remain private and protected by the platform security protocols.',
  },
  {
    question: 'When does a coach or psychologist step in?',
    answer:
      'A specialist can take over when the student asks for human support or when a priority need is detected.',
  },
]

export default function RapportFAQFonctionnalites() {
  const isFr = useLocale() !== 'en'
  const reportTraits = isFr ? reportTraitsFr : reportTraitsEn
  const faqItems = isFr ? faqItemsFr : faqItemsEn
  const [openIndex, setOpenIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const sectionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }
  const sectionAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const leftInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }
  const rightInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }
  const cardAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }
  const rowInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }
  const rowAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const faqInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }
  const faqAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <motion.div
        className="relative z-10 mx-auto grid max-w-[1200px] items-stretch gap-5 font-[family-name:var(--font-zain)] lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]"
        initial={sectionInitial}
        whileInView={sectionAnimate}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.article
          className="rounded-[22px] border border-[var(--mindly-border)] bg-white p-5 shadow-[0_16px_42px_rgba(137,94,248,0.10)] sm:p-6"
          initial={leftInitial}
          whileInView={cardAnimate}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <span className={`${sectionBadgeClass} min-w-0 px-4 py-2 text-[11px]`}>
              <span className={sectionBadgeDotClass} />
              {isFr ? 'Exemple de rapport' : 'Sample report'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mindly-lavender-700)] bg-[var(--mindly-lavender-150)] px-4 py-2 text-[12px] font-bold text-[var(--mindly-primary-muted)]">
              <Brain className="h-3.5 w-3.5" />
              {isFr ? 'Profil Big Five' : 'Big Five profile'}
            </span>
          </div>

          <div className="space-y-4">
            {reportTraits.map(({ label, description, level, score, Icon }, index) => (
              <motion.div
                key={label}
                className="rounded-[18px] border border-[var(--mindly-border)] bg-[var(--mindly-lavender-50)] p-4 shadow-[0_10px_28px_rgba(137,94,248,0.06)]"
                initial={rowInitial}
                whileInView={rowAnimate}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[var(--mindly-bg-lavender)] text-[var(--mindly-primary)]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[18px] font-bold leading-tight text-[var(--mindly-text-strong)]">
                          {label}
                        </h3>
                        <p className="mt-1 text-[14px] font-normal leading-[1.65] text-[var(--mindly-purple-muted)]">
                          {description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span className="rounded-full border border-[var(--mindly-border)] bg-white px-3 py-1 text-[11px] font-bold text-[var(--mindly-purple-muted)]">
                          {level}
                        </span>
                        <motion.span
                          className="text-[28px] font-bold leading-none text-[var(--mindly-primary)]"
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{
                            duration: 0.45,
                            delay: shouldReduceMotion ? 0 : index * 0.08 + 0.18,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {score}%
                        </motion.span>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--mindly-bg-lavender)]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)]"
                        initial={{ width: shouldReduceMotion ? `${score}%` : '0%' }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 1.1,
                          delay: shouldReduceMotion ? 0 : index * 0.08 + 0.12,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.article>

        <motion.article
          className="flex h-full flex-col rounded-[26px] border border-[var(--mindly-border)] bg-white p-5 shadow-[0_22px_58px_rgba(137,94,248,0.12)] sm:p-7"
          initial={rightInitial}
          whileInView={cardAnimate}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className={`${sectionBadgeClass} min-w-0 px-4 py-2 text-[11px]`}>
              <span className={sectionBadgeDotClass} />
              FAQ
            </span>

            <h2 className="mt-6 max-w-[360px] text-[34px] font-bold leading-[1.05] tracking-[-0.025em] text-[var(--mindly-text-strong)] sm:text-[40px]">
              {isFr ? 'Questions sur les fonctionnalites' : 'Questions about features'}
            </h2>
            <p className="mt-4 text-[15px] font-normal leading-[1.7] text-[var(--mindly-purple-muted)]">
              {isFr
                ? 'Comprendre comment MindBloom accompagne les etudiants.'
                : 'Understand how MindBloom supports students.'}
            </p>
          </div>

          <div className="mt-7 flex flex-1 flex-col justify-between gap-6">
            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index

                return (
                  <motion.div
                    key={item.question}
                    className="rounded-[16px] border border-[var(--mindly-border)] bg-[var(--mindly-lavender-50)] shadow-[0_8px_24px_rgba(137,94,248,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--mindly-lavender-900)] hover:shadow-[0_14px_30px_rgba(137,94,248,0.16)]"
                    initial={faqInitial}
                    whileInView={faqAnimate}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[15px] font-bold leading-[1.35] text-[var(--mindly-text-strong)]">
                        {item.question}
                      </span>
                      <motion.span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--mindly-primary)] shadow-[0_8px_18px_rgba(137,94,248,0.10)]"
                        animate={{ rotate: isOpen && !shouldReduceMotion ? 45 : 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          initial={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -4 }}
                          animate={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto', y: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 pr-14 text-[14px] font-normal leading-[1.65] text-[var(--mindly-purple-muted)]">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex items-start gap-3 rounded-[16px] border border-[var(--mindly-lavender-700)] bg-[var(--mindly-lavender-150)] p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-[var(--mindly-primary)]">
                <Lock className="h-4 w-4" />
              </span>
              <p className="text-[14px] font-normal leading-[1.65] text-[var(--mindly-purple-muted)]">
                {isFr
                  ? "Chaque fonctionnalite a ete pensee pour aider l'etudiant a mieux comprendre son etat emotionnel et demander de l'aide au bon moment."
                  : 'Each feature is designed to help students better understand their emotional state and ask for help at the right moment.'}
              </p>
              <ShieldQuestion className="ml-auto hidden h-5 w-5 shrink-0 text-[var(--mindly-primary)] sm:block" />
            </div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  )
}

