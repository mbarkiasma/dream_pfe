import { Card, CardContent } from '@/components/ui/card'

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
  const stats: { label: string; value: string; hint: string }[] = [
    { label: 'Mes reves', value: String(dreamsCount), hint: 'Journal personnel' },
    { label: 'Mes analyses', value: String(analysesCount), hint: 'Suivi IA' },
    { label: 'Rendez-vous', value: String(appointmentsCount), hint: 'Planifies' },
  ]

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => (
        <Card
          key={item.label}
          className="overflow-hidden rounded-[24px] border border-white/70 bg-white/75 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur"
        >
          <CardContent className="relative p-5">
            <div className="absolute right-4 top-4 h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100" />
            <p className="text-sm font-semibold text-[#6E628F]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#2d1068]">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-[#9A8BB7]">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
