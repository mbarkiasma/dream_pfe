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
    <div className="dream-stats-grid-three">
      {stats.map((item) => (
        <Card key={item.label} className="dream-stat-card">
          <CardContent className="dream-stat-content">
            <div className="dream-stat-mark" />
            <p className="dream-stat-label">{item.label}</p>
            <p className="dream-stat-value">{item.value}</p>
            <p className="dream-stat-hint">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
