import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachExercisesPage() {
  return (
    <div>
      <CoachTopbar
        title="Exercices"
        description="Gerez les exercices et les taches attribues aux etudiants."
      />

      <div className="mindly-stack-lg">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              Aucun exercice attribue
            </CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <p className="mindly-feature-text">
              Les exercices, taches et consignes crees par le coach apparaitront ici avec leur
              statut et leur echeance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
