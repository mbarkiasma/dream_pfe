import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyProfilPage() {
  return (
    <div>
      <PsyTopbar
        title="Mon profil"
        description="Consultez vos informations generales et les parametres lies a votre activite."
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
                Cette section affichera plus tard les informations du psychologue connecte : nom,
                email, role et autres informations generales.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mindly-stack-lg">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">
                Statut du compte
              </CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <p className="mindly-feature-text">
                Les informations de validation du compte apparaitront ici.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
