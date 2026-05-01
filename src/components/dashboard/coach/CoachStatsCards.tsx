import { Card, CardContent } from '@/components/ui/card'

const stats: { label: string; value: string; hint: string }[] = [
  { label: 'Etudiants assignes', value: '--', hint: 'Suivi actif' },
  { label: 'Exercices actifs', value: '--', hint: 'A accompagner' },
  { label: 'Rendez-vous prevus', value: '--', hint: 'Planning' },
  { label: 'Cas a orienter', value: '--', hint: 'Priorite' },
]

export function CoachStatsCards() {
  return (
    <div className="dream-stats-grid-four">
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
