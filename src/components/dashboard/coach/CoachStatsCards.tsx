'use client'

import { BookOpenCheck, CalendarDays, Stethoscope, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type CoachStatsCardsProps = {
  activeExercisesCount?: number
  assignedStudentsCount: number
  orientationCasesCount: number
  upcomingEventsCount: number
}

export function CoachStatsCards({
  activeExercisesCount = 0,
  assignedStudentsCount,
  orientationCasesCount,
  upcomingEventsCount,
}: CoachStatsCardsProps) {
  const t = useTranslations('dashboard.coach.stats')

  const stats = [
    {
      href: '/dashboard/coach/students',
      icon: UsersRound,
      label: t('students'),
      value: String(assignedStudentsCount),
      hint: assignedStudentsCount > 0 ? t('studentsHintActive') : t('studentsHintEmpty'),
    },
    {
      href: '/dashboard/coach/exercices',
      icon: BookOpenCheck,
      label: t('exercises'),
      value: String(activeExercisesCount),
      hint: activeExercisesCount > 0 ? t('exercisesHintActive') : t('exercisesHintEmpty'),
    },
    {
      href: '/dashboard/coach/rendez_vous',
      icon: CalendarDays,
      label: t('appointments'),
      value: String(upcomingEventsCount),
      hint: upcomingEventsCount > 0 ? t('appointmentsHintActive') : t('appointmentsHintEmpty'),
    },
    {
      href: '/dashboard/coach/orientation_psy',
      icon: Stethoscope,
      label: t('cases'),
      value: String(orientationCasesCount),
      hint: orientationCasesCount > 0 ? t('casesHintActive') : t('casesHintEmpty'),
    },
  ]

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
