import { Card, CardContent } from '@/components/ui/card'

const stats = [
  { label: 'Mes rêves', value: '--', hint: 'Données dynamiques' },
  { label: 'Mes analyses', value: '--', hint: 'Données dynamiques' },
  { label: 'Rendez-vous', value: '--', hint: 'Données dynamiques' },
]

export function StudentStatsCards() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => (
        <Card
          key={item.label}
          className="rounded-[24px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]"
        >
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">{item.value}</p>
            <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}