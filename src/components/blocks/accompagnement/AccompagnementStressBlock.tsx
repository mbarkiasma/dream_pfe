'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  BookOpen,
  CircleHelp,
  Handshake,
  HeartPulse,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'

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
    color: 'var(--mindly-primary)',
    bg: 'bg-[var(--mindly-bg-pale)]',
    text: (
      <>
        n&apos;ont <strong>jamais consulté</strong> un psychologue à l&apos;université
      </>
    ),
  },
]

const BASE_RGB = '159, 112, 226'
const MAX_HEIGHT = 180
const CHART_FRAME_CLASS = 'w-full'
const CHART_WIDTH_CLASS = 'min-w-[860px] w-full'

const sources = [
  {
    short: 'Examens',
    label: 'Examens',
    pct: 95,
    level: 'Très élevé',
    desc: 'Surcharge, deadlines accumulées, manque de sommeil et pression de performance en période de révisions.',
  },
  {
    short: 'Sommeil',
    label: 'Sommeil',
    pct: 80,
    level: 'Élevé',
    desc: 'Insomnies, rêves anxieux, récupération faible et rythme déréglé affectant la concentration.',
  },
  {
    short: 'Isolement',
    label: 'Isolement',
    pct: 75,
    level: 'Élevé',
    desc: "Éloignement familial, solitude dans un nouveau cadre de vie et difficultés d'adaptation.",
  },
  {
    short: 'Relations',
    label: 'Relations sociales',
    pct: 75,
    level: 'Élevé',
    desc: 'Comparaison, conflits de groupe, pression familiale et attentes sociales difficiles à satisfaire.',
  },
  {
    short: 'Finances',
    label: 'Finances',
    pct: 70,
    level: 'Élevé',
    desc: "Logement, alimentation, frais d'études et gestion d'un premier budget autonome.",
  },
  {
    short: 'Orientation',
    label: 'Orientation',
    pct: 55,
    level: 'Modéré',
    desc: "Doutes sur le choix de filière, peur de l'échec et manque de vision sur l'avenir professionnel.",
  },
  {
    short: 'Avenir pro.',
    label: 'Avenir professionnel',
    pct: 55,
    level: 'Modéré',
    desc: "Incertitude sur le marché de l'emploi, manque de réseau et peur de ne pas trouver sa place.",
  },
  {
    short: 'Santé mentale',
    label: 'Santé mentale',
    pct: 35,
    level: 'Sous-estimé',
    desc: 'Signaux faibles rarement exprimés, souvent repérés trop tard. Le tabou reste un frein majeur.',
  },
]

const gridValues = [100, 75, 50, 25, 0]

const legendItems = [
  { label: 'Très élevé (95%)', alpha: 1.0 },
  { label: 'Élevé (70-80%)', alpha: 0.72 },
  { label: 'Modéré (55%)', alpha: 0.46 },
  { label: 'Sous-estimé (35%)', alpha: 0.26 },
]

type StressSource = (typeof sources)[number]

function getAlpha(pct: number): number {
  if (pct >= 90) return 1.0
  if (pct >= 70) return 0.72
  if (pct >= 50) return 0.46
  return 0.26
}

function barHeight(pct: number): number {
  return Math.round((pct / 100) * MAX_HEIGHT)
}

const fadeUpEase = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: fadeUpEase },
  },
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
          animate={inView ? { strokeDashoffset: 0, opacity: 1 } : { strokeDashoffset: 1, opacity: 0 }}
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
          <span className="mb-[14px] block font-[family-name:var(--font-zain)] text-[40px] font-bold leading-none tracking-[-0.04em] text-[var(--mindly-primary-light)]">
            1/3
          </span>
        ) : (
          <AnimatedPercent
            end={stat.end ?? 0}
            className="mb-[14px] block font-[family-name:var(--font-zain)] text-[40px] font-bold leading-none tracking-[-0.04em]"
            style={{ color: stat.color }}
          />
        )}
      </motion.div>

      <p className="font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.7] text-[var(--mindly-purple-muted)] [&_strong]:font-semibold [&_strong]:text-[var(--mindly-purple-muted)]">
        {stat.text}
      </p>
    </motion.div>
  )
}

function Header() {
  return (
    <div className={`mx-auto mb-6 flex ${CHART_FRAME_CLASS} flex-wrap items-center gap-3`}>
      <div className={sectionBadgeClass}>
        <span className={sectionBadgeDotClass} />8 sources de stress étudiant
      </div>
    </div>
  )
}

function GridLines() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[68px]"
      style={{ top: '32px' }}
    >
      {gridValues.map((value) => (
        <div
          key={value}
          className="absolute w-full"
          style={{ bottom: `${(value / 100) * MAX_HEIGHT}px` }}
        >
          <span className="absolute -left-10 -top-2 whitespace-nowrap text-[10px] text-[var(--mindly-purple-muted)]">
            {value}%
          </span>
        </div>
      ))}
    </div>
  )
}

function BarsArea({
  inView,
  active,
  onHover,
}: {
  inView: boolean
  active: number | null
  onHover: (index: number | null) => void
}) {
  return (
    <div
      className={`grid ${CHART_WIDTH_CLASS} grid-cols-8 items-end gap-[18px] px-10`}
      style={{ height: MAX_HEIGHT + 40 }}
    >
      {sources.map((source, index) => {
        const height = barHeight(source.pct)
        const alpha = getAlpha(source.pct)

        return (
          <div
            key={source.short}
            className="group relative flex h-full cursor-pointer flex-col items-center justify-end"
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(index)}
            onBlur={() => onHover(null)}
            tabIndex={0}
          >
            <motion.span
              className="absolute whitespace-nowrap text-[12px] font-medium text-[var(--mindly-primary)]"
              style={{ bottom: height + 10 }}
              initial={{ opacity: 0, y: 4 }}
              animate={inView ? { opacity: active === index ? 1 : 0.7, y: 0 } : { opacity: 0, y: 4 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
            >
              {source.pct}%
            </motion.span>

            <motion.div
              className="relative w-full max-w-[76px] overflow-hidden"
              style={{
                borderRadius: '999px 999px 8px 8px',
                height,
              }}
              whileHover={{ scaleX: 1.06 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  borderRadius: '999px 999px 8px 8px',
                  background: `rgba(${BASE_RGB}, ${alpha})`,
                }}
                initial={{ height: '0%' }}
                animate={inView ? { height: '100%' } : { height: '0%' }}
                transition={{
                  duration: 1,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

function XLabels() {
  return (
    <div className={`mt-[10px] grid ${CHART_WIDTH_CLASS} grid-cols-8 gap-[18px] px-10`}>
      {sources.map((source) => (
        <div
          key={source.short}
          className="text-center text-[12px] font-bold leading-[1.35] text-[var(--mindly-text)]"
        >
          {source.short}
        </div>
      ))}
    </div>
  )
}

function Legend() {
  return (
    <div
      className={`mx-auto mt-[18px] flex ${CHART_WIDTH_CLASS} flex-wrap gap-4 border-t border-[var(--mindly-border)] pt-[16px]`}
    >
      {legendItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-[7px] font-[family-name:var(--font-zain)] text-[15.5px] font-normal leading-[1.5] text-[var(--mindly-purple-muted)]"
        >
          <div
            className="h-[10px] w-[10px] rounded-[3px]"
            style={{ background: `rgba(${BASE_RGB}, ${item.alpha})` }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}

function DetailBox({ source }: { source: StressSource | null }) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.2 }}
      className={`mx-auto mb-[14px] flex min-h-[44px] ${CHART_FRAME_CLASS} items-center gap-[10px] rounded-[16px] border border-[var(--mindly-border)] bg-white p-[12px_16px] font-[family-name:var(--font-zain)] text-[15.5px] font-normal leading-[1.5] text-[var(--mindly-purple-muted)] shadow-[0_10px_28px_rgba(137,94,248,0.08)]`}
    >
      {source ? (
        <>
          <span>
            <strong className="mr-1 font-bold text-[var(--mindly-text)]">{source.label}</strong>
            — {source.level} · {source.desc}
          </span>
          <span className="ml-auto text-[16px] font-medium" style={{ color: `rgba(${BASE_RGB}, 1)` }}>
            {source.pct}%
          </span>
        </>
      ) : (
        <span>Survolez une barre pour afficher les détails de chaque source de stress.</span>
      )}
    </motion.div>
  )
}

function StressBarChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const [active, setActive] = useState<number | null>(null)

  return (
    <div>
      <Header />

      <DetailBox source={active !== null ? sources[active] ?? null : null} />

      <div
        ref={ref}
        className="overflow-x-auto p-[12px_8px_20px]"
      >
        <div className={`relative mx-auto ${CHART_WIDTH_CLASS}`}>
          <GridLines />
          <BarsArea inView={inView} active={active} onHover={setActive} />
          <XLabels />
        </div>

        <Legend />
      </div>
    </div>
  )
}

function StressReportList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="mx-auto w-full">
        <StressBarChart />
      </div>
    </motion.div>
  )
}

export default function AccompagnementStressBlock() {
  const { lang } = useLanguage()
  const isFr = lang === 'fr'

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_24%_20%,rgba(137,94,248,0.08),transparent_34%),radial-gradient(circle_at_82%_48%,rgba(137,94,248,0.10),transparent_36%)]" />

      <div className="relative z-10 mx-auto max-w-[1280px] font-[family-name:var(--font-zain)]">
        <div className="mb-9 grid gap-8 lg:grid-cols-[minmax(0,760px)_minmax(240px,1fr)] lg:items-start lg:gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
              viewport={{ once: true }}
              className={`mb-7 ${sectionBadgeClass}`}
            >
              <span className={sectionBadgeDotClass} />
              {isFr ? 'Contexte & enjeux' : 'Context & challenges'}
            </motion.div>

            <motion.h2
              data-font-hero="true"
              className="mb-5 max-w-[780px] font-[family-name:var(--font-zain)] text-[34px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px] lg:text-[48px] xl:text-[52px]"
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
              className="max-w-[700px] font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)] [&_strong]:font-medium [&_strong]:text-[var(--mindly-purple-muted)]"
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
          className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
