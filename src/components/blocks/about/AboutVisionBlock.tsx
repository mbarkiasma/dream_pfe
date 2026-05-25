'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Building2, Target, UserRoundCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AppBadge, sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const descriptionTextClass =
  'text-[15px] font-normal leading-[1.7] tracking-normal text-[var(--mindly-purple-muted)]'

export default function AboutVisionBlock() {
  const t = useTranslations('aboutPage.vision')
  const shouldReduceMotion = useReducedMotion()
  const smoothEase = [0.22, 1, 0.36, 1] as const
  const visionCardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }
  const visionBadgeInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }
  const visionItemInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
  const visionWordInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }
  const timelineInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }
  const statInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }
  const visionCardVariants = {
    hidden: visionCardInitial,
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.82,
        ease: smoothEase,
        staggerChildren: shouldReduceMotion ? 0 : 0.13,
        delayChildren: shouldReduceMotion ? 0 : 0.16,
      },
    },
    hover: {
      y: shouldReduceMotion ? 0 : -5,
      transition: { duration: 0.38, ease: smoothEase },
    },
  }
  const visionBadgeVariants = {
    hidden: visionBadgeInitial,
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: smoothEase },
    },
  }
  const visionTitleVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.045,
        delayChildren: shouldReduceMotion ? 0 : 0.03,
      },
    },
  }
  const visionWordVariants = {
    hidden: visionWordInitial,
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.46, ease: smoothEase },
    },
  }
  const visionItemVariants = {
    hidden: visionItemInitial,
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.52, ease: smoothEase },
    },
  }
  const visionShineVariants = {
    hidden: { opacity: 0, x: '-140%' },
    visible: { opacity: 0, x: '-140%' },
    hover: {
      opacity: [0, 0.34, 0],
      x: '360%',
      transition: { duration: 1.15, ease: smoothEase },
    },
  }

  const etapes = t.raw('steps') as Array<{
    annee: string
    titre: string
    description: string
  }>

  const objectifsRaw = t.raw('objectives') as Array<{
    icon: 'building2' | 'target' | 'userRoundCheck'
    titre: string
    description: string
  }>

  const visionTitle = t('title')
  const visionDescription = t('description')
  const visionTitleWords = visionTitle.split(' ')

  const iconMap = {
    building2: Building2,
    target: Target,
    userRoundCheck: UserRoundCheck,
  } as const

  const objectifs = objectifsRaw.map((objectif) => ({
    Icon: iconMap[objectif.icon],
    ...objectif,
  }))

  return (
    <section id="vision-2028" className="mx-auto max-w-[1200px] scroll-mt-28 px-5 pb-10 font-[family-name:var(--font-zain)] sm:px-8">
      <motion.div
        className="group relative overflow-hidden rounded-[2rem] border border-[var(--mindly-primary-soft)] p-8 shadow-[var(--mindly-shadow-lg)] transition-[border-color,box-shadow] duration-300 ease-out will-change-transform hover:border-[var(--mindly-border-strong)] hover:shadow-[var(--mindly-shadow-xl)] sm:p-9"
        variants={visionCardVariants}
        initial="hidden"
        whileInView="visible"
        whileHover={shouldReduceMotion ? undefined : 'hover'}
        viewport={{ once: true, amount: 0.3 }}
        style={{
          background:
            'radial-gradient(circle at 10% 0%, var(--mindly-lavender-250) 0%, transparent 34%), radial-gradient(circle at 92% 92%, var(--mindly-secondary-soft) 0%, transparent 32%), var(--mindly-surface)',
        }}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[var(--mindly-primary)]/10 blur-3xl"
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0], x: [0, 6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-6 h-52 w-52 rounded-full bg-[var(--mindly-primary-light)]/10 blur-3xl"
          animate={shouldReduceMotion ? undefined : { y: [0, -10, 0], x: [0, -8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 top-6 h-24 w-24 rounded-full bg-[var(--mindly-secondary)]/8 blur-2xl"
          animate={shouldReduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-[var(--mindly-white)]/60 to-transparent blur-sm"
          variants={visionShineVariants}
        />

        <div className="relative z-10 space-y-6">
          <motion.div variants={visionBadgeVariants}>
            <AppBadge
              dot
              dotClassName={sectionBadgeDotClass}
              variant="outline"
              className={sectionBadgeClass}
            >
              Vision 2028
            </AppBadge>
          </motion.div>
          <motion.h2
            className="text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px]"
            variants={visionTitleVariants}
          >
            {visionTitleWords.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="inline-block"
                variants={visionWordVariants}
              >
                {word}
                {index < visionTitleWords.length - 1 ? '\u00A0' : ''}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
            className={`max-w-[980px] ${descriptionTextClass}`}
            variants={visionItemVariants}
          >
            {visionDescription}
          </motion.p>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {etapes.map((etape, index) => (
          <motion.div
            key={etape.annee}
            className="h-full"
            initial={timelineInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.08 + index * 0.08, ease: smoothEase }}
          >
            <Card className="relative h-full overflow-hidden rounded-[2rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-0 shadow-[0_16px_38px_rgba(111,77,215,0.10)] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:border-[var(--mindly-primary-soft)] hover:shadow-[0_22px_54px_rgba(111,77,215,0.14)]">
              <CardContent className="relative flex h-full flex-col space-y-5 p-7">
                <div className="flex items-center gap-4">
                  <AppBadge size="sm" className="border-[var(--mindly-lavender-700)] bg-[var(--mindly-lavender-300)] text-[var(--mindly-purple-note)] font-semibold text-[15px]">
                    {etape.annee}
                  </AppBadge>
                  <h3 className="text-[24px] font-bold leading-tight text-[var(--mindly-text-strong)]">{etape.titre}</h3>
                </div>
                <p className={descriptionTextClass}>{etape.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {objectifs.map((objectif, index) => (
          <motion.div
            key={objectif.titre}
            className="h-full"
            initial={statInitial}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.34 + index * 0.07, ease: smoothEase }}
          >
            <Card className="relative h-full overflow-hidden rounded-[2rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-0 shadow-[0_16px_38px_rgba(111,77,215,0.10)] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:border-[var(--mindly-primary-soft)] hover:shadow-[0_22px_54px_rgba(111,77,215,0.14)]">
              <CardContent className="relative flex h-full flex-col space-y-5 p-7">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--mindly-secondary)]/10">
                  <objectif.Icon className="h-6 w-6 text-[var(--mindly-primary-muted)]" />
                </div>
                <h3 className="text-[24px] font-bold leading-tight text-[var(--mindly-text-strong)]">{objectif.titre}</h3>
                <p className={descriptionTextClass}>{objectif.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

