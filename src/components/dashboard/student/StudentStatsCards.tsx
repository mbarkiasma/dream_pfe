import { Card, CardContent } from '@/components/ui/card'
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
    <div className="dream-stats-grid-three">
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <Link
            key={item.label}
            href={item.href}
            className="group block rounded-[28px] outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <Card className="overflow-hidden rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur transition duration-200 group-hover:-translate-y-1 group-hover:border-border group-hover:bg-white group-hover:shadow-[0_22px_65px_rgba(109,40,217,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)] dark:group-hover:bg-white/[0.09]">
              <CardContent className="relative p-5">
                <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-100 to-fuchsia-100 text-dream-accent shadow-inner transition group-hover:scale-105 group-hover:from-violet-500 group-hover:to-fuchsia-400 group-hover:text-white dark:from-violet-500/20 dark:to-fuchsia-400/15 dark:text-violet-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="pr-14 text-sm font-semibold text-dream-muted dark:text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-dream-heading dark:text-foreground">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium text-[#9A8BB7] dark:text-muted-foreground">
                  {item.hint}
                </p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
