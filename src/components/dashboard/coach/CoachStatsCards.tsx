import { BookOpenCheck, CalendarDays, Stethoscope, UsersRound } from 'lucide-react'
import Link from 'next/link'

type CoachStatsCardsProps = {
  activeExercisesCount?: number
  assignedStudentsCount: number
  orientationCasesCount: number
  upcomingEventsCount: number
}

function getStats({
  activeExercisesCount = 0,
  assignedStudentsCount,
  orientationCasesCount,
  upcomingEventsCount,
}: CoachStatsCardsProps) {
  return [
    {
      href: '/dashboard/coach/students',
      icon: UsersRound,
      label: 'Étudiants assignés',
      value: String(assignedStudentsCount),
      hint: assignedStudentsCount > 0 ? 'Suivi actif' : 'Aucun suivi',
    },
    {
      href: '/dashboard/coach/exercices',
      icon: BookOpenCheck,
      label: 'Exercices actifs',
      value: String(activeExercisesCount),
      hint: activeExercisesCount > 0 ? 'À accompagner' : 'Aucun exercice',
    },
    {
      href: '/dashboard/coach/rendez_vous',
      icon: CalendarDays,
      label: 'Rendez-vous prévus',
      value: String(upcomingEventsCount),
      hint: upcomingEventsCount > 0 ? 'Planning' : 'Aucun planning',
    },
    {
      href: '/dashboard/coach/orientation_psy',
      icon: Stethoscope,
      label: 'Cas à orienter',
      value: String(orientationCasesCount),
      hint: orientationCasesCount > 0 ? 'Priorité' : 'Aucun cas',
    },
  ]
}

export function CoachStatsCards(props: CoachStatsCardsProps) {
  const stats = getStats(props)

  return (
    <div className="mindly-stats-grid-four">
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
