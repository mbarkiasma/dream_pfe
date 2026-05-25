'use client'

import { Link } from '@/i18n/routing'
import { motion } from 'motion/react'
import { BarChart2, Mail, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { appBadgeCtaClass, sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const stepIcons = [UserRound, Mail, BarChart2]

export default function AccompagnementProcessBlock() {
  const t = useTranslations('homePage.hero')
  const badge = t('process.badge')
  const description = t('process.description')
  const cta = t('process.cta')
  const title = t('process.title')
  const stepLabel = t('process.stepLabel')
  const freeText = t('process.free')
  const noPassword = t('process.noPassword')
  const fastText = t('process.fast')
  const steps = t.raw('process.steps') as Array<{ id: string; title: string; description: string }>

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_24%_20%,rgba(137,94,248,0.08),transparent_34%),radial-gradient(circle_at_82%_48%,rgba(137,94,248,0.10),transparent_36%)]" />

      <div className="relative z-10 mx-auto max-w-[1280px] font-[family-name:var(--font-zain)]">
        <div className="mb-14 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className={`mb-7 ${sectionBadgeClass}`}
          >
            <span className={sectionBadgeDotClass} />
            {badge}
          </motion.div>

          <motion.h2
            data-font-hero="true"
            className="font-[family-name:var(--font-zain)] text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px] lg:text-[48px] xl:text-[52px]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <p className="mx-auto mt-4 max-w-[720px] font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)]">
            {description}
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-[calc(33.33%-14px)] right-[calc(33.33%-14px)] top-11 hidden h-[1.5px] bg-[linear-gradient(90deg,rgba(137,94,248,0.25),rgba(169,135,255,0.35),rgba(137,94,248,0.25))] lg:block" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-3"
          >
            {steps.map((step, index) => {
              const Icon = stepIcons[index]
              return (
                <motion.article
                  key={step.id}
                  variants={fadeUp}
                  className="group relative overflow-visible rounded-[22px] border border-[var(--mindly-border)] bg-white p-5 pt-14 text-center shadow-[0_10px_28px_rgba(137,94,248,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(137,94,248,0.14)]"
                >
                  <div className="absolute inset-x-0 top-0 h-[3.5px] rounded-t-[28px] bg-[linear-gradient(90deg,#895ef8,#a987ff)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {index < steps.length - 1 && (
                    <span className="absolute right-[-18px] top-10 z-20 hidden h-3 w-3 rounded-full border-[2.5px] border-[rgba(137,94,248,0.40)] bg-[var(--mindly-bg)] transition-all duration-300 group-hover:scale-125 group-hover:border-[var(--mindly-primary)] lg:block" />
                  )}

                  <motion.div
                    whileHover={{ y: -4, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute left-1/2 top-0 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mindly-primary-soft)] bg-[linear-gradient(90deg,#895ef8,#a987ff)] text-white shadow-[0_12px_28px_rgba(137,94,248,0.22)] ring-0 ring-[var(--mindly-primary-light)]/0 transition-all duration-300 group-hover:ring-4 group-hover:ring-[var(--mindly-primary-light)]/20"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  <span className="inline-flex rounded-full border border-[var(--mindly-primary)]/45 bg-[var(--mindly-bg-strong)] px-4 py-1.5 text-[12px] font-normal uppercase tracking-[0.12em] text-[var(--mindly-primary)] transition-all duration-300 group-hover:border-transparent group-hover:bg-[linear-gradient(90deg,#895ef8,#a987ff)] group-hover:text-white">
                    {stepLabel} {step.id}
                  </span>

                  <h3 className="mt-5 text-[17px] font-normal leading-[1.35] text-[var(--mindly-text-strong)]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[14px] font-normal leading-[1.72] text-[var(--mindly-purple-muted)]">
                    {step.description}
                  </p>
                </motion.article>
              )
            })}
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/login" className={appBadgeCtaClass}>
            <span className="relative z-10">{cta} ?</span>
          </Link>

          <p className="mt-4 text-[14px] font-normal text-[var(--mindly-purple-muted)]">
            <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text font-bold text-transparent">
              {freeText}
            </span>
            <span className="mx-2 text-[var(--mindly-lavender-800)]">·</span>
            <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text font-bold text-transparent">
              {noPassword}
            </span>
            <span className="mx-2 text-[var(--mindly-lavender-800)]">·</span>
            <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text font-bold text-transparent">
              {fastText}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

