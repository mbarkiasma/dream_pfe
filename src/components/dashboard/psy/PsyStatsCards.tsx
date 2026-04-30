import { Card, CardContent } from '@/components/ui/card'

type PsyStat = {
  label: string
  value: number | string
  hint: string
}

type PsyStatsCardsProps = {
  stats?: PsyStat[]
}

const defaultStats: PsyStat[] = [
  { label: 'Etudiants assignes', value: 0, hint: 'Suivi clinique' },
  { label: 'Rendez-vous prevus', value: 0, hint: 'Consultations' },
  { label: 'Cas en attente', value: 0, hint: 'A traiter' },
]

export function PsyStatsCards({ stats = defaultStats }: PsyStatsCardsProps) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => (
        <Card
          key={item.label}
          className="overflow-hidden rounded-[24px] border border-border bg-card/75 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_55px_rgba(0,0,0,0.28)]"
        >
          <CardContent className="relative p-5">
            <div className="absolute right-4 top-4 h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-500/20 dark:to-fuchsia-500/20" />
            <p className="text-sm font-semibold text-dream-muted dark:text-violet-100/80">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-dream-heading dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-[#9A8BB7] dark:text-white/50">
              {item.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
