'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { HandHeart, Lock, Scale, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

const descriptionTextClass =
  'text-[15px] font-normal leading-[1.7] tracking-normal text-[var(--mindly-purple-muted)]'

const iconMap = {
  lock: Lock,
  shieldCheck: ShieldCheck,
  handHeart: HandHeart,
  scale: Scale,
} as const

export default function AboutEthicsBlock() {
  const t = useTranslations('aboutPage.ethics')
  const shouldReduceMotion = useReducedMotion()
  const smoothEase = [0.22, 1, 0.36, 1] as const
  const sectionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const cardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96 }
  const itemInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }

  const valeursFromLocale = t.raw('values') as Array<{
    icon: keyof typeof iconMap
    title: string
    description: string
    quote: string
  }>

  const valeurs = valeursFromLocale.map((valeur) => ({
    Icon: iconMap[valeur.icon],
    ...valeur,
  }))

  return (
    <motion.section
      id="valeurs"
      className="mx-auto max-w-[1200px] scroll-mt-28 px-5 pb-10 font-[family-name:var(--font-zain)] sm:px-8"
      initial={sectionInitial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: smoothEase }}
    >
      <div className="mb-8 text-center">
        <motion.h2
          className="mt-4 font-[family-name:var(--font-zain)] text-[30px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[40px]"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, delay: 0.08, ease: smoothEase }}
        >
          {t('title')}{' '}
          <span className="bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text text-transparent">
            MindBloom
          </span>
        </motion.h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {valeurs.map((valeur, index) => (
          <motion.article
            key={`${valeur.title}-${index}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--mindly-primary-soft)]/70 bg-[var(--mindly-surface)] p-5 text-[var(--mindly-text-dark)] shadow-[0_16px_40px_rgba(74,35,176,0.10)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--mindly-primary)] hover:shadow-[0_22px_54px_rgba(74,35,176,0.22)]"
            style={{ animationDelay: `${index * 80}ms` }}
            initial={cardInitial}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: 0.1 + index * 0.1, ease: smoothEase }}
          >
            <div className="pointer-events-none absolute inset-x-4 -top-14 h-32 rounded-full bg-[var(--mindly-primary)]/0 blur-2xl transition-all duration-500 group-hover:bg-[var(--mindly-primary)]/38" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-16 top-8 h-36 w-36 rounded-full bg-[var(--mindly-primary)]/32 blur-3xl" />
              <div className="absolute -left-14 bottom-8 h-32 w-32 rounded-full bg-[var(--mindly-primary-deep)]/24 blur-3xl" />
            </div>

            <motion.div
              className="relative mb-7 flex items-center justify-between"
              initial={itemInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: 0.24 + index * 0.1, ease: smoothEase }}
            >
              <span className="text-[21px] font-bold leading-none text-[var(--mindly-primary)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--mindly-bg-lavender)] text-[var(--mindly-primary)] transition-all duration-300 ease-out group-hover:scale-[1.08] group-hover:bg-[var(--mindly-lavender-300)]">
                <valeur.Icon className="h-5 w-5 text-[var(--mindly-purple-icon)]" />
              </div>
            </motion.div>

            <motion.h3
              className="relative text-[28px] font-bold leading-[1.05] tracking-normal text-[var(--mindly-text-dark)]"
              initial={itemInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: 0.28 + index * 0.1, ease: smoothEase }}
            >
              {valeur.title}
            </motion.h3>

            <motion.p
              className={`relative mt-4 min-h-[112px] flex-1 ${descriptionTextClass}`}
              initial={itemInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: 0.32 + index * 0.1, ease: smoothEase }}
            >
              {valeur.description}
            </motion.p>

            <motion.p
              className="relative mt-auto rounded-full border border-[var(--mindly-primary-soft)] bg-[var(--mindly-lavender-200)] px-4 py-2 text-[13px] font-bold leading-tight text-[var(--mindly-primary)]"
              initial={itemInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: 0.36 + index * 0.1, ease: smoothEase }}
            >
              {valeur.quote}
            </motion.p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  )
}

