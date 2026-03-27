import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachExercisesPage() {
  return (
    <div>
      <CoachTopbar
        title="Exercices"
        description="Gérez les exercices et les tâches attribués aux étudiants."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-slate-800">Aucun exercice attribué</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-slate-600">
              Les exercices, tâches et consignes créés par le coach apparaîtront ici avec leur statut
              et leur échéance.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}