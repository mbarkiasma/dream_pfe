'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AppBadge, sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const founderProfiles = [
  {
    nom: 'Oumaima Bouzayen',
    photo: '/fondatrices/oumaima.jpg',
    email: 'oumaima.bouzayen@mindbloom.tn',
  },
  {
    nom: 'Asma Mbarki',
    photo: '/fondatrices/asma.jpg',
    email: 'asma.mbarki@mindbloom.tn',
  },
]

const specialistProfiles = [
  {
    nom: 'Sana Belhadj',
    photo: '/specialistes/sana.png',
  },
  {
    nom: 'Mehdi Chaabane',
    photo: '/specialistes/mehdi.png',
  },
  {
    nom: 'Rim Trabelsi',
    photo: '/specialistes/rim.png',
  },
  {
    nom: 'Yassine Ferchichi',
    photo: '/specialistes/yassine.png',
  },
  {
    nom: 'Nour Ben Salah',
    photo: '/specialistes/nour.png',
  },
  {
    nom: 'Dr. Amira Nasri',
    photo: '/specialistes/amira.png',
  },
]

const descriptionTextClass =
  'text-[15px] font-normal leading-[1.7] tracking-normal text-[var(--mindly-purple-muted)]'

const leadTextClass =
  'text-[16px] font-normal leading-[1.75] tracking-normal text-[var(--mindly-purple-muted)]'

export default function AboutTeamBlock() {
  const t = useTranslations('aboutPage.team')
  const teamBadge = t('teamBadge')
  const foundersTitlePrimary = t('foundersTitlePrimary')
  const foundersTitleHighlight = t('foundersTitleHighlight')
  const founderLabel = t('founderLabel')
  const foundersData = t.raw('founders') as Array<{
    role: string
    description: string
    specialty: string
  }>
  const specialistsData = t.raw('specialists') as Array<{
    title: string
    description: string
    specialties: string[]
    note: string
  }>
  const specialistsTitlePrimary = t('specialistsTitlePrimary')
  const specialistsTitleHighlight = t('specialistsTitleHighlight')
  const specialistsDescription = t('specialistsDescription')

  const shouldReduceMotion = useReducedMotion()
  const badgeInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }
  const titleInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const cardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }
  const cardAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
  const specialistSectionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const specialistCardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96 }
  const specialistItemInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const badgeInsideInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const badgeInsideAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const smoothEase = [0.22, 1, 0.36, 1] as const

  return (
    <section id="equipe" className="mx-auto max-w-[1200px] space-y-10 px-5 py-10 font-[family-name:var(--font-zain)] sm:px-8">
      <div id="fondatrices-encadrante" className="scroll-mt-28 space-y-6">
        <div className="text-left">
          <motion.div
            className="flex justify-start"
            initial={badgeInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: smoothEase }}
          >
            <AppBadge dot dotClassName={sectionBadgeDotClass} variant="outline" casing="upper" className={sectionBadgeClass}>
              {teamBadge}
            </AppBadge>
          </motion.div>
          <motion.h2
            className="mt-4 font-[family-name:var(--font-zain)] text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px]"
            initial={titleInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.08, ease: smoothEase }}
          >
            {foundersTitlePrimary}{' '}
            <span className="text-[var(--mindly-text)]">{foundersTitleHighlight}</span>
          </motion.h2>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {founderProfiles.map((founder, index) => {
            const profile = foundersData[index]
            return (
              <motion.div
                key={founder.nom}
                className="group h-full"
                initial={cardInitial}
                whileInView={cardAnimate}
                viewport={{ once: true, amount: 0.22 }}
                transition={{
                  duration: 0.65,
                  delay: shouldReduceMotion ? 0 : index * 0.12,
                  ease: smoothEase,
                }}
              >
                <Card
                  className="relative h-full min-h-[250px] overflow-hidden rounded-[1.6rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-7 shadow-[0_18px_44px_rgba(111,77,215,0.11)] transition-all duration-300 ease-out group-hover:-translate-y-[6px] group-hover:border-[var(--mindly-purple-border)] group-hover:shadow-[0_24px_62px_rgba(111,77,215,0.18)]"
                >
                  <span className="pointer-events-none absolute -left-6 top-[-14px] h-20 w-20 rounded-full bg-[var(--mindly-primary)]/14" />
                  <span className="pointer-events-none absolute -right-8 bottom-3 h-32 w-32 rounded-full bg-[var(--mindly-primary-light)]/16" />
                  <CardContent className="relative p-0">
                    <div className="grid gap-5 sm:grid-cols-[1fr_150px] sm:items-start">
                      <div className="space-y-3">
                        <motion.div
                          className="w-fit"
                          initial={badgeInsideInitial}
                          whileInView={badgeInsideAnimate}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.12 + 0.18, ease: smoothEase }}
                        >
                          <AppBadge
                            variant="outline"
                            size="sm"
                            casing="upper"
                            icon={<Sparkles className="h-3 w-3" />}
                            radius="pill"
                            className={`w-fit ${sectionBadgeClass}`}
                          >
                            {founderLabel}
                          </AppBadge>
                        </motion.div>
                        <div className="space-y-1">
                          <p className="text-[26px] font-bold leading-tight text-[var(--mindly-text-strong)]">{founder.nom}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mindly-secondary)]">
                            {profile.role}
                          </p>
                          <a
                            href={`mailto:${founder.email}`}
                            className="text-[13px] text-[var(--mindly-primary)] hover:underline"
                          >
                            {founder.email}
                          </a>
                        </div>
                        <div className="h-[2px] w-7 rounded-full bg-[var(--mindly-primary-soft)]" />
                        <p className="text-[15px] leading-7 text-[var(--mindly-text)]">{profile.description}</p>
                        <p className="flex items-center gap-2 text-[14px] text-[var(--mindly-text)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--mindly-primary)]" />
                          <span>
                            <span className="font-semibold">{t('specialtyLabel')} :</span> {profile.specialty}
                          </span>
                        </p>
                        <motion.div
                          className="w-fit"
                          initial={badgeInsideInitial}
                          whileInView={badgeInsideAnimate}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.12 + 0.26, ease: smoothEase }}
                        >
                          <AppBadge variant="outline" size="sm" casing="upper" className={`w-fit ${sectionBadgeClass}`}>
                            IA · Web
                          </AppBadge>
                        </motion.div>
                      </div>
                      <div className="relative h-[180px] w-full overflow-hidden rounded-[1.6rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-2 sm:h-[210px]">
                        <Image
                          src={founder.photo}
                          alt={founder.nom}
                          fill
                          className="rounded-[1.25rem] object-cover"
                          sizes="(max-width: 640px) 140px, 150px"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <motion.div
        id="equipe-specialistes"
        className="scroll-mt-28 space-y-6"
        initial={specialistSectionInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: smoothEase }}
      >
        <div className="text-left">
          <div className="flex justify-start">
            <AppBadge dot dotClassName={sectionBadgeDotClass} variant="outline" casing="upper" className={sectionBadgeClass}>
              {t('specialistSectionBadge')}
            </AppBadge>
          </div>
          <motion.h2
            className="mt-3 font-[family-name:var(--font-zain)] text-[30px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[38px]"
            initial={specialistSectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.08, ease: smoothEase }}
          >
            {specialistsTitlePrimary}{' '}
            <span className="text-[var(--mindly-text)]">{specialistsTitleHighlight}</span>
          </motion.h2>
          <motion.p
            className={`mt-5 max-w-[880px] ${leadTextClass}`}
            initial={specialistItemInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.35, delay: 0.18, ease: smoothEase }}
          >
            {specialistsDescription}
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {specialistProfiles.map((specialistProfile, index) => {
            const specialist = specialistsData[index]
            return (
              <motion.div
                key={specialistProfile.nom}
                className="h-full"
                initial={specialistCardInitial}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, delay: 0.1 + index * 0.1, ease: smoothEase }}
              >
                <Card
                  className="group relative flex h-full overflow-hidden rounded-[1.5rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-5 shadow-[0_14px_36px_rgba(111,77,215,0.10)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[var(--mindly-purple-border)] hover:shadow-[0_20px_52px_rgba(111,77,215,0.16)]"
                >
                  <CardContent className="relative flex h-full w-full flex-col p-0">
                    <div className="flex items-start justify-between gap-3">
                      <AppBadge size="sm" className={sectionBadgeClass}>
                        {specialist.title}
                      </AppBadge>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-[var(--mindly-border)] bg-[var(--mindly-lavender-300)]">
                        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-[var(--mindly-purple-note)]">
                          {specialistProfile.nom
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                        <Image src={specialistProfile.photo} alt={specialistProfile.nom} fill className="object-cover object-center" sizes="64px" />
                      </div>
                    </div>
                    <motion.p
                      className="mt-4 text-[18px] font-bold leading-tight text-[var(--mindly-text)]"
                      initial={specialistItemInitial}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35, delay: 0.24 + index * 0.1, ease: smoothEase }}
                    >
                      {specialistProfile.nom}
                    </motion.p>
                    <motion.div
                      className="mt-1.5 flex items-center gap-2"
                      initial={specialistItemInitial}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35, delay: 0.28 + index * 0.1, ease: smoothEase }}
                    >
                      <span
                        aria-label={`${specialist.note} / 5`}
                        className="text-[13px] tracking-[0.22em] text-[var(--mindly-warning)]"
                      >
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <span key={starIndex} aria-hidden="true">
                            ★
                          </span>
                        ))}
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--mindly-primary-muted)]">{specialist.note}</span>
                    </motion.div>
                    <motion.p
                      className={`${descriptionTextClass} flex-1`}
                      initial={specialistItemInitial}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35, delay: 0.32 + index * 0.1, ease: smoothEase }}
                    >
                      {specialist.description}
                    </motion.p>
                    <motion.div
                      className="mt-5 flex flex-wrap gap-2"
                      initial={specialistItemInitial}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35, delay: 0.36 + index * 0.1, ease: smoothEase }}
                    >
                      {specialist.specialties.map((speciality) => (
                        <AppBadge
                          key={`${specialistProfile.nom}-${speciality}`}
                          size="xs"
                          className="border-[var(--mindly-lavender-700)] bg-[var(--mindly-bg)] text-[var(--mindly-primary-muted)] font-medium tracking-[0.06em]"
                        >
                          {speciality}
                        </AppBadge>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
