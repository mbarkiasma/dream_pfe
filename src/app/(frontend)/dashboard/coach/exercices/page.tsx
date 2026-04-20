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
        <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[#2d1068]">Aucun exercice attribué</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F]">
              Les exercices, tâches et consignes créés par le coach apparaîtront ici avec leur statut
              et leur échéance.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}