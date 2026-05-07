import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachStudentsPage() {
  return (
    <div>
      <CoachTopbar
        title="Etudiants assignes"
        description="Consultez les profils des etudiants suivis par le coach."
      />

      <div className="mindly-stack-lg">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              Aucun etudiant assigne
            </CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <p className="mindly-feature-text">
              Les profils des etudiants attribues au coach apparaitront ici avec leurs informations
              principales, leur etat general et leur suivi.
            </p>

            <div className="mt-4">
              <span className="mindly-ui-badge">Aucun etudiant</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">Informations</CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <p className="mindly-feature-text">
              Cette page permettra plus tard d'acceder au profil etudiant, a ses reves, a ses
              analyses, a ses taches et a ses notes de coaching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
