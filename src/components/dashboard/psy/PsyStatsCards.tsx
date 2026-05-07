import { AlertTriangle, CalendarDays, UsersRound } from 'lucide-react'
import Link from 'next/link'

type PsyStat = {
  href?: string
  icon?: typeof UsersRound
  label: string
  value: number | string
  hint: string
}

type PsyStatsCardsProps = {
  stats?: PsyStat[]
}

const defaultStats: PsyStat[] = [
  {
    href: '/dashboard/psy/students',
    icon: UsersRound,
    label: 'Etudiants assignes',
    value: 0,
    hint: 'Suivi clinique',
  },
  {
    href: '/dashboard/psy/rendez_vous',
    icon: CalendarDays,
    label: 'Rendez-vous prevus',
    value: 0,
    hint: 'Consultations',
  },
  {
    href: '/dashboard/psy/rendez_vous',
    icon: AlertTriangle,
    label: 'Cas en attente',
    value: 0,
    hint: 'A traiter',
  },
]

export function PsyStatsCards({ stats = defaultStats }: PsyStatsCardsProps) {
  return (
    <div className="mindly-stats-grid-three">
      {stats.map((item, index) => {
        const Icon = item.icon ?? defaultStats[index]?.icon ?? UsersRound
        const href = item.href ?? defaultStats[index]?.href ?? '/dashboard/psy'

        return (
          <Link
            key={item.label}
            href={href}
            className="group block rounded-[28px] outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <article className="mindly-stat-card transition duration-200 group-hover:-translate-y-1 group-hover:border-[var(--mindly-border-violet)] group-hover:bg-white group-hover:shadow-[var(--mindly-shadow-xl)]">
              <div className="mindly-stat-content">
                <div className="mindly-stat-mark transition duration-200 group-hover:scale-105 group-hover:bg-[var(--mindly-primary)] group-hover:text-white">
                  <Icon />
                </div>

                <p className="mindly-stat-label pr-14">{item.label}</p>
                <p className="mindly-stat-value">{item.value}</p>
                <p className="mindly-stat-hint">{item.hint}</p>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
