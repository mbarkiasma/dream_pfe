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
        <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-dream-heading dark:text-white">
              Aucun exercice attribue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-dream-muted dark:text-white/65">
              Les exercices, taches et consignes crees par le coach apparaitront ici avec leur
              statut et leur echeance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
