import { BarChart3, CalendarDays, MoonStar } from 'lucide-react'
import Link from 'next/link'

type StudentStatsCardsProps = {
  analysesCount: number
  dreamsCount: number
  appointmentsCount?: number
}

export function StudentStatsCards({
  analysesCount,
  appointmentsCount = 0,
  dreamsCount,
}: StudentStatsCardsProps) {
  const stats = [
    {
      href: '/dashboard/student/dreams',
      icon: MoonStar,
      label: 'Mes reves',
      value: String(dreamsCount),
      hint: 'Journal personnel',
    },
    {
      href: '/dashboard/student/analyses',
      icon: BarChart3,
      label: 'Mes analyses',
      value: String(analysesCount),
      hint: 'Suivi IA',
    },
    {
      href: '/dashboard/student/rendez_vous',
      icon: CalendarDays,
      label: 'Rendez-vous',
      value: String(appointmentsCount),
      hint: 'Planifies',
    },
  ]

  return (
    <div className="mindly-stats-grid-three">
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <Link
            key={item.label}
            href={item.href}
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