'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'motion/react'
import type { Variants } from 'motion/react'
import {
  BookOpen,
  Brain,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  Compass,
  GraduationCap,
  Handshake,
  HeartPulse,
  Home,
  Info,
  MoonStar,
  PiggyBank,
  Users,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const BOTTOM = 170

const chartBars = [
  { id: 'dc1', x: 10, targetY: 132, h: 38, fill: 'rgba(137,94,248,.15)' },
  { id: 'dc2', x: 60, targetY: 95, h: 75, fill: 'rgba(137,94,248,.30)' },
  { id: 'dc3', x: 110, targetY: 48, h: 122, fill: 'rgba(137,94,248,.48)' },
  { id: 'dc4', x: 160, targetY: 72, h: 98, fill: 'rgba(137,94,248,.36)' },
  { id: 'dc5', x: 210, targetY: 18, h: 152, fill: 'url(#gBar2)' },
]

const stats = [
  {
    icon: HeartPulse,
    value: '78%',
    end: 78,
    color: 'var(--mindly-primary)',
    bg: 'bg-[var(--mindly-bg-strong)]',
    text: (
      <>
        des étudiants ressentent un <strong>stress élevé</strong> pendant les examens
      </>
    ),
  },
  {
    icon: CircleHelp,
    value: '1/3',
    color: 'var(--mindly-primary-light)',
    bg: 'bg-[var(--mindly-bg-strong)]',
    text: (
      <>
        présentent des signes d&apos;<strong>anxiété chronique</strong> non pris en charge
      </>
    ),
  },
  {
    icon: BookOpen,
    value: '64%',
    end: 64,
    color: 'var(--mindly-primary)',
    bg: 'bg-[var(--mindly-bg-strong)]',
    text: (
      <>
        affirment que le stress affecte directement <strong>leurs notes</strong>
      </>
    ),
  },
  {
    icon: Handshake,
    value: '92%',
    end: 92,
    color: 'var(--mindly-primary-soft-3)',
    bg: 'bg-[var(--mindly-bg-pale)]',
    text: (
      <>
        n&apos;ont <strong>jamais consulté</strong> un psychologue à l&apos;université
      </>
    ),
  },
]

const stressSources = [
  {
    id: 1,
    label: 'Examens',
    pct: 95,
    level: 'Très élevé',
    desc: 'Surcharge, deadlines accumulées, manque de sommeil et pression de performance en période de révisions.',
    icon: 'graduation',
  },
  {
    id: 2,
    label: 'Isolement',
    pct: 75,
    level: 'Élevé',
    desc: "Éloignement familial, solitude dans un nouveau cadre de vie et difficultés d'adaptation.",
    icon: 'home',
  },
  
  {
    id: 4,
    label: 'Sommeil',
    pct: 75,
    level: 'Élevé',
    desc: 'Insomnies, rêves anxieux, récupération faible et rythme déréglé affectant la concentration.',
    icon: 'moon',
  },
  {
    id: 5,
    label: 'Relations sociales',
    pct: 75,
    level: 'Élevé',
    desc: 'Comparaison, conflits de groupe, pression familiale et attentes sociales difficiles à satisfaire.',
    icon: 'users',
  },
  {
    id: 6,
    label: 'Orientation',
    pct: 55,
    level: 'Modéré',
    desc: "Doutes sur le choix de filière, peur de l'échec et manque de vision sur l'avenir professionnel.",
    icon: 'compass',
  },
  {
    id: 7,
    label: 'Avenir professionnel',
    pct: 55,
    level: 'Modéré',
    desc: "Incertitude sur le marché de l'emploi, manque de réseau et peur de ne pas trouver sa place.",
    icon: 'chart',
  },
  
  
]

const fadeUpEase = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: fadeUpEase },
  },
}

function SourceIcon({
  icon,
  className,
  style,
}: {
  icon: string
  className?: string
  style?: CSSProperties
}) {
  const props = { className, style }

  switch (icon) {
    case 'graduation':
      return <GraduationCap {...props} />
    case 'home':
      return <Home {...props} />
    case 'dollar':
      return <PiggyBank {...props} />
    case 'moon':
      return <MoonStar {...props} />
    case 'users':
      return <Users {...props} />
    case 'compass':
      return <Compass {...props} />
    case 'chart':
      return <ChartNoAxesColumnIncreasing {...props} />
    case 'brain':
      return <Brain {...props} />
    default:
      return <Info {...props} />
  }
}

function DecorativeChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div ref={ref} className="hidden justify-self-end pt-8 opacity-90 lg:block">
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
        {chartBars.map((bar, i) => (
          <motion.rect
            key={bar.id}
            x={bar.x}
            width={36}
            rx={16}
            fill={bar.fill}
            initial={{ y: BOTTOM, height: 0 }}
            animate={inView ? { y: bar.targetY, height: bar.h } : { y: BOTTOM, height: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0, 0, 0.2, 1],
            }}
          />
        ))}

        <motion.path
          d="M28 132 Q78 95 128 48 Q178 72 228 18"
          stroke="url(#gLine2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          initial={{ strokeDashoffset: 1, opacity: 0 }}
          animate={
            inView
              ? { strokeDashoffset: 0, opacity: 1 }
              : { strokeDashoffset: 1, opacity: 0 }
          }
          transition={{
            strokeDashoffset: { duration: 0.8, delay: 0.6, ease: [0.42, 0, 0.58, 1] },
            opacity: { duration: 0.1, delay: 0.6 },
          }}
        />

        {[{ cx: 28, cy: 132 }, { cx: 128, cy: 48 }, { cx: 228, cy: 18 }].map(
          (point, index) => (
            <motion.circle
              key={`${point.cx}-${point.cy}`}
              cx={point.cx}
              cy={point.cy}
              r="4"
              fill="var(--mindly-white)"
              stroke="url(#gLine2)"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 12,
                delay: 1.4 + index * 0.12,
              }}
            />
          ),
        )}

        <defs>
          <linearGradient id="gLine2" x1="0" y1="0" x2="260" y2="0">
            <stop stopColor="var(--mindly-primary)" />
            <stop offset="1" stopColor="var(--mindly-primary-light)" />
          </linearGradient>

          <linearGradient id="gBar2" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--mindly-primary)" />
            <stop offset="1" stopColor="var(--mindly-primary-light)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function AnimatedPercent({
  end,
  className,
  style,
}: {
  end: number
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    let frame = 0
    let start: number | null = null
    const duration = 1800

    const tick = (time: number) => {
      start ??= time
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(Math.round(end * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [end, inView])

  return (
    <span ref={ref} className={className} style={style}>
      {value}%
    </span>
  )
}

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const Icon = stat.icon

  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-[24px] border border-[var(--mindly-border)] bg-white p-[26px_22px] shadow-[0_14px_34px_rgba(137,94,248,0.08)] transition-all duration-[280ms] hover:-translate-y-[5px] hover:shadow-[0_22px_48px_rgba(137,94,248,0.16)]"
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] ${stat.bg}`}
      >
        <Icon className="h-5 w-5" style={{ color: stat.color }} />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {stat.value === '1/3' ? (
          <span className="mb-[14px] block font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-none tracking-[-0.04em] text-[var(--mindly-primary-light)]">
            1/3
          </span>
        ) : (
          <AnimatedPercent
            end={stat.end ?? 0}
            className="mb-[14px] block font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-none tracking-[-0.04em]"
            style={{ color: stat.color }}
          />
        )}
      </motion.div>

      <p className="font-[family-name:var(--font-body)] text-[15px] font-normal leading-[1.7] text-[var(--mindly-purple-muted)] [&_strong]:font-semibold [&_strong]:text-[var(--mindly-purple-muted)]">
        {stat.text}
      </p>
    </motion.div>
  )
}

function StressReportList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="w-full rounded-[34px] border border-[var(--mindly-border-strong)] bg-white/75 p-5 shadow-[0_24px_70px_rgba(137,94,248,0.13)] backdrop-blur-sm sm:p-6"
    >
      <div className="mx-auto w-full max-w-[1120px] rounded-[28px] border border-[var(--mindly-border)] bg-[var(--mindly-bg)] p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-[var(--mindly-border-strong)] bg-white px-5 py-2 text-[13px] font-semibold tracking-[0.02em] text-[var(--mindly-primary)] shadow-[0_8px_22px_rgba(137,94,248,0.08)]">
              <span className="mr-2 h-2 w-2 rounded-full bg-[var(--mindly-primary)]" />
              8 sources principales de stress
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--mindly-border)] bg-white p-5 shadow-[0_18px_45px_rgba(137,94,248,0.10)] sm:p-6">
            <div className="space-y-6">
              {stressSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true }}
                  className="group relative -m-3 rounded-[18px] p-3 transition-[background-color] duration-[220ms] ease-out hover:bg-[rgba(159,112,226,0.025)]"
                >
                  <span className="pointer-events-none absolute left-0 top-3 h-[calc(100%-24px)] w-[3px] rounded-full bg-[var(--mindly-primary)] opacity-0 transition-opacity duration-[250ms] ease-out group-hover:opacity-100" />

                  <div className="mb-3 grid grid-cols-[1fr_auto] items-start gap-6">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--mindly-lavender-800)] bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)] shadow-[0_8px_18px_rgba(137,94,248,0.08)] transition-transform duration-[300ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-[1.10] group-hover:rotate-[-3deg]">
                        <SourceIcon icon={source.icon} className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-[var(--font-poppins)] text-[21px] font-bold leading-tight text-[var(--mindly-primary)]">
                          {source.label}
                        </h3>

                        <p className="mt-1 max-w-[760px] font-[var(--font-body)] text-[14.5px] leading-relaxed text-[var(--mindly-purple-muted)]">
                          {source.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-[160px] shrink-0 items-center justify-end gap-4">
                      <span className="rounded-full border border-[var(--mindly-lavender-800)] bg-white px-4 py-1.5 font-[var(--font-body)] text-[12px] font-semibold tracking-[0.14em] text-[var(--mindly-primary)]">
                        {source.level}
                      </span>

                      <span className="w-[58px] text-right font-[var(--font-poppins)] text-[28px] font-bold leading-none text-[var(--mindly-primary)]">
                        {source.pct}%
                      </span>
                    </div>
                  </div>

                  <div className="relative h-[6px] overflow-hidden rounded-full bg-[var(--mindly-lavender-300)]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${source.pct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.3 + index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)]"
                    />

                    <motion.span
                      initial={{ left: 0 }}
                      whileInView={{ left: `${source.pct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.3 + index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      viewport={{ once: true }}
                      className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mindly-primary)] shadow-[0_0_0_4px_rgba(137,94,248,0.15)]"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function StressAccompagnement() {
  const { lang } = useLanguage()
  const isFr = lang === 'fr'

  return (
    <section className="relative overflow-hidden bg-[var(--mindly-bg)] px-5 py-14 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(137,94,248,0.08),transparent_34%),radial-gradient(circle_at_82%_48%,rgba(137,94,248,0.10),transparent_36%)]" />

      <div className="relative z-10 mx-auto max-w-[1280px] font-[family-name:var(--font-body)]">
        <div className="mb-9 grid gap-8 lg:grid-cols-[minmax(0,760px)_minmax(240px,1fr)] lg:items-start lg:gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
              viewport={{ once: true }}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--mindly-primary)]/35 bg-white px-5 py-2 text-[13.5px] font-semibold text-[var(--mindly-primary)] shadow-[0_8px_24px_rgba(137,94,248,0.08)]"
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[var(--mindly-primary)] to-[var(--mindly-primary-light)]" />
              {isFr ? 'Contexte & enjeux' : 'Context & challenges'}
            </motion.div>

            <motion.h2
              data-font-hero="true"
              className="mb-5 max-w-[780px] font-[family-name:var(--font-sora)] text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px] lg:text-[48px] xl:text-[52px]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              {isFr ? (
                <>Une génération sous pression</>
              ) : (
                <>
                  University life: a challenge
                  <br />
                  for <em>student well-being</em>
                </>
              )}
            </motion.h2>

            <motion.p
              className="max-w-[760px] font-[family-name:var(--font-body)] text-[16px] font-normal leading-[1.75] text-[var(--mindly-purple-muted)] [&_strong]:font-medium [&_strong]:text-[var(--mindly-purple-muted)]"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              {isFr ? (
                <>
                  Les étudiants font face à des <strong>pressions croissantes</strong> qui
                  impactent leurs résultats. Un accompagnement adapté et une analyse de
                  personnalité changent tout, pour l&apos;étudiant comme pour l&apos;université.
                </>
              ) : (
                <>
                  Students face <strong>increasing pressure</strong> that affects their results.
                  Tailored support and personality analysis change everything, for students and
                  universities alike.
                </>
              )}
            </motion.p>
          </div>

          <DecorativeChart />
        </div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-16 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCard key={stat.value} stat={stat} />
          ))}
        </motion.div>

        <div className="mx-auto w-full">
          <StressReportList />
        </div>
      </div>
    </section>
  )
}
