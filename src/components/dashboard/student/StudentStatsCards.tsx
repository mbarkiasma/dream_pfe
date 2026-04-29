import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, CalendarDays, MoonStar } from 'lucide-react'

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
    { icon: MoonStar, label: 'Mes reves', value: String(dreamsCount), hint: 'Journal personnel' },
    { icon: BarChart3, label: 'Mes analyses', value: String(analysesCount), hint: 'Suivi IA' },
    {
      icon: CalendarDays,
      label: 'Rendez-vous',
      value: String(appointmentsCount),
      hint: 'Planifies',
    },
  ]

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <Card
            key={item.label}
            className="group overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(109,40,217,0.16)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)] dark:hover:bg-white/[0.08]"
          >
            <CardContent className="relative p-5">
              <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 shadow-inner dark:from-violet-500/20 dark:to-fuchsia-400/15 dark:text-violet-200">
                <Icon className="h-5 w-5" />
              </div>
              <p className="pr-14 text-sm font-semibold text-[#6E628F] dark:text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-[#2d1068] dark:text-foreground">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium text-[#9A8BB7] dark:text-muted-foreground">
                {item.hint}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
