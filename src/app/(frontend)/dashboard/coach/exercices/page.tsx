import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachExercisesPage() {
  return (
    <div>
      <CoachTopbar
        title="Exercices"
        description="Gerez les exercices et les taches attribues aux etudiants."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[#2d1068] dark:text-white">
              Aucun exercice attribue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F] dark:text-white/65">
              Les exercices, taches et consignes crees par le coach apparaitront ici avec leur
              statut et leur echeance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
