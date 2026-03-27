import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachPlanPage() {
  return (
    <div>
      <CoachTopbar
        title="Plan coaching"
        description="Définissez et consultez les objectifs, l’organisation et les axes de travail des étudiants."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Aucun plan disponible</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les plans de coaching construits pour les étudiants apparaîtront ici, avec les objectifs
                liés à l’organisation, la gestion du stress, la motivation ou les soft skills.
              </p>

            </CardContent>
          </Card>
      </div>
      </div>
    </div>
  )
  }