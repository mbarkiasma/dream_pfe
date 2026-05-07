import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachProfilePage() {
  return (
    <div>
      <CoachTopbar
        title="Mon profil"
        description="Consultez vos informations generales et les parametres lies a votre activite de coach."
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">
                Informations personnelles
              </CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <p className="mindly-feature-text">
                Cette section affichera plus tard les informations du coach connecte : nom, email,
                role et informations generales.
              </p>

              <div className="mt-4">
                <span className="mindly-ui-badge">Donnees utilisateur</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
