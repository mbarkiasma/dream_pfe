'use client'

import { Link } from '@/i18n/routing'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Rocket, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { useLocale } from 'next-intl'

const cardsFr = [
  {
    href: '#fondatrices-encadrante',
    title: "Les fondatrices & l'encadrante",
    description: 'Decouvrez les fondatrices du projet et notre encadrante academique.',
    Icon: UsersRound,
    className: 'lg:left-[calc(50%-125px)] lg:top-[42px] xl:left-[calc(50%-140px)]',
    floatDuration: 6.2,
    floatDelay: 0,
  },
  {
    href: '#equipe-specialistes',
    title: 'Notre equipe de specialistes',
    description: 'Rencontrez nos expertes dediees au bien-etre etudiant.',
    Icon: UsersRound,
    className: 'lg:left-0 lg:top-[150px]',
    floatDuration: 7,
    floatDelay: 0.35,
  },
  {
    href: '#valeurs',
    title: 'Une ethique forte au coeur de MindBloom',
    description: 'Nos principes, nos engagements et notre responsabilite.',
    Icon: ShieldCheck,
    className: 'lg:right-0 lg:top-[150px]',
    floatDuration: 5.8,
    floatDelay: 0.18,
  },
  {
    href: '#vision-2028',
    title: 'Vision 2028',
    description: 'Notre feuille de route pour un impact durable et mesurable.',
    Icon: Rocket,
    className: 'lg:left-[calc(50%-125px)] lg:top-[290px] xl:left-[calc(50%-140px)]',
    floatDuration: 6.8,
    floatDelay: 0.5,
  },
]

const cardsEn: typeof cardsFr = [
  {
    href: '#fondatrices-encadrante',
    title: 'Founders & supervisor',
    description: 'Discover the project founders and our academic supervisor.',
    Icon: UsersRound,
    className: 'lg:left-[calc(50%-125px)] lg:top-[42px] xl:left-[calc(50%-140px)]',
    floatDuration: 6.2,
    floatDelay: 0,
  },
  {
    href: '#equipe-specialistes',
    title: 'Our specialist team',
    description: 'Meet our experts dedicated to student well-being.',
    Icon: UsersRound,
    className: 'lg:left-0 lg:top-[150px]',
    floatDuration: 7,
    floatDelay: 0.35,
  },
  {
    href: '#valeurs',
    title: 'Strong ethics at MindBloom core',
    description: 'Our principles, commitments and responsibility.',
    Icon: ShieldCheck,
    className: 'lg:right-0 lg:top-[150px]',
    floatDuration: 5.8,
    floatDelay: 0.18,
  },
  {
    href: '#vision-2028',
    title: 'Vision 2028',
    description: 'Our roadmap for lasting and measurable impact.',
    Icon: Rocket,
    className: 'lg:left-[calc(50%-125px)] lg:top-[290px] xl:left-[calc(50%-140px)]',
    floatDuration: 6.8,
    floatDelay: 0.5,
  },
]

export default function AboutHeroBlock() {
  const isFr = useLocale() !== 'en'
  const cards = isFr ? cardsFr : cardsEn
  const shouldReduceMotion = useReducedMotion()
  const smoothEase = [0.22, 1, 0.36, 1] as const
  const cardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.98 }
  const cardAnimate = { opacity: 1, y: 0, scale: 1 }
  const connectorProps = shouldReduceMotion
    ? {}
    : {
        animate: { strokeDashoffset: [0, -32] },
        transition: { duration: 2, ease: 'linear' as const, repeat: Infinity },
      }
  return (
    <section
      id="a-propos-hero"
      className="relative mx-auto min-h-[430px] overflow-hidden px-2 pb-8 pt-1 font-[family-name:var(--font-zain)] sm:px-5 lg:min-h-[410px] lg:pt-0"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[34px] hidden h-[350px] w-[980px] -translate-x-1/2 overflow-visible lg:block"
        viewBox="0 0 1120 410"
        fill="none"
      >
        <motion.path d="M560 96 C560 132 560 158 560 184" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M560 250 C560 292 560 322 560 352" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M626 217 H806" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M494 217 H314" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M395 96 C278 104 236 138 214 198" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M725 96 C842 104 884 138 906 198" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M214 236 C236 306 280 342 395 352" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M906 236 C884 306 840 342 725 352" stroke="var(--mindly-primary-light)" strokeWidth="1.8" strokeDasharray="6 10" opacity="0.9" {...connectorProps} />
        <motion.path d="M395 96 C442 136 474 164 510 190" stroke="var(--mindly-primary)" strokeWidth="1.3" strokeDasharray="6 10" opacity="0.62" {...connectorProps} />
        <motion.path d="M725 96 C678 136 646 164 610 190" stroke="var(--mindly-primary)" strokeWidth="1.3" strokeDasharray="6 10" opacity="0.62" {...connectorProps} />
        <motion.path d="M395 352 C442 316 474 286 510 244" stroke="var(--mindly-primary)" strokeWidth="1.3" strokeDasharray="6 10" opacity="0.62" {...connectorProps} />
        <motion.path d="M725 352 C678 316 646 286 610 244" stroke="var(--mindly-primary)" strokeWidth="1.3" strokeDasharray="6 10" opacity="0.62" {...connectorProps} />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1120px]">
        <div className="relative grid gap-3 lg:block lg:h-[365px]">
          <motion.div
            className="relative mx-auto flex min-h-[62px] w-full max-w-[130px] items-center justify-center rounded-[22px] border border-white/75 bg-[linear-gradient(90deg,#895ef8,#a987ff)] text-white shadow-[0_14px_36px_rgba(137,94,248,0.22),inset_0_0_0_6px_rgba(255,255,255,0.16)] lg:absolute lg:left-[calc(50%-65px)] lg:top-[172px]"
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.035, 1] }}
            transition={shouldReduceMotion ? undefined : { duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          >
            <span className="pointer-events-none absolute inset-[-18px] rounded-[36px] bg-[var(--mindly-primary)]/16 blur-2xl" />
            {[0, 0.8].map((delay) => (
              <motion.span
                key={delay}
                className="pointer-events-none absolute inset-[-10px] rounded-[36px] border border-[var(--mindly-primary-light)]/35"
                animate={shouldReduceMotion ? undefined : { opacity: [0, 0.34, 0], scale: [0.92, 1.28, 1.48] }}
                transition={shouldReduceMotion ? undefined : { duration: 2.4, delay, ease: 'easeOut', repeat: Infinity }}
              />
            ))}
            <Sparkles className="h-10 w-10 text-white/90" />
          </motion.div>

          {cards.map(({ href, title, description, Icon, className, floatDuration, floatDelay }, index) => (
            <motion.div
              key={href}
              className={`relative w-full lg:absolute lg:w-[250px] xl:w-[280px] ${className}`}
              initial={cardInitial}
              whileInView={cardAnimate}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: smoothEase }}
            >
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={shouldReduceMotion ? undefined : { duration: floatDuration, delay: floatDelay, ease: 'easeInOut', repeat: Infinity }}
              >
                <Link
                  href={href}
                  className="group relative flex min-h-[86px] w-full items-center gap-3 rounded-[16px] border border-[var(--mindly-lavender-800)] bg-[var(--mindly-surface-glass)] p-3.5 text-left shadow-[0_12px_28px_rgba(137,94,248,0.09)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--mindly-primary)]/50 hover:shadow-[0_18px_40px_rgba(137,94,248,0.14)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--mindly-primary-soft-3)] bg-[var(--mindly-surface-soft)] text-[var(--mindly-primary)] shadow-[0_10px_20px_rgba(137,94,248,0.13)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[15.5px] font-bold leading-[1.12] tracking-normal text-[var(--mindly-title-blue)]">
                      {title}
                    </span>
                    <span className="mt-1 block text-[12.5px] font-medium leading-[1.3] tracking-normal text-[var(--mindly-text-purple)]">
                      {description}
                    </span>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-bold tracking-normal text-[var(--mindly-primary)] transition-all duration-300 group-hover:gap-2.5">
                      {isFr ? 'Aller a la section' : 'Go to section'}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-[5px]" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

