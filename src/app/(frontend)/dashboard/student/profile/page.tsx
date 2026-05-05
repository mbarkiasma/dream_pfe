import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function formatAnalysisDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getDisplayName(
  user:
    | { firstName?: string | null; lastName?: string | null; email?: string | null }
    | null
    | undefined,
) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()

  return fullName || user?.email || 'Non renseigne'
}

export default async function StudentProfilePage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

  const analyses = user
    ? await payload.find({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
        sort: '-date',
        limit: 5,
      })
    : { docs: [] }

  return (
    <div>
      <StudentTopbar
        title="Mon profil"
        description="Consulte vos informations generales, vos objectifs et vos rapports d'analyse."
      />

      <div className="student-profile-grid">
        <div className="student-profile-main">
          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title-lg">
                Informations personnelles
              </CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                <div className="student-profile-info-grid">
                  <div className="student-profile-info-box">
                    <p className="student-profile-label">Nom</p>
                    <p className="student-profile-value">{getDisplayName(user)}</p>
                  </div>

                  <div className="student-profile-info-box">
                    <p className="student-profile-label">Email</p>
                    <p className="student-profile-value">{user?.email || 'Non renseigne'}</p>
                  </div>
                </div>

                <div>
                  <span className="student-profile-badge">Profil etudiant connecte</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">Mes analyses en PDF</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                {analyses.docs.length > 0 ? (
                  analyses.docs.map((analyse) => (
                    <div key={analyse.id} className="student-profile-analysis-row">
                      <div>
                        <p className="student-profile-analysis-title">{analyse.reference}</p>
                        <p className="student-profile-analysis-date">
                          Generee le {formatAnalysisDate(analyse.date)}
                        </p>
                      </div>

                      <div className="student-profile-actions">
                        <Link
                          href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                          className="student-profile-link-secondary"
                        >
                          Voir le rapport
                        </Link>

                        <Link
                          href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                          target="_blank"
                          className="student-profile-link-primary"
                        >
                          Telecharger en PDF
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="student-profile-empty">
                    <p className="student-profile-text">
                      Aucune analyse n'est encore disponible. Des qu'un entretien est termine, un
                      rapport PDF apparaitra ici.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="student-profile-side">
          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">Rapports disponibles</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content-compact">
              <p className="student-profile-text">
                Chaque entretien termine peut maintenant etre consulte et exporte en PDF depuis ce
                profil.
              </p>

              <div className="mt-4">
                <span className="student-profile-badge">
                  {analyses.docs.length} rapport{analyses.docs.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="student-profile-card-soft">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">Progression</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content-compact">
              <p className="student-profile-text">
                Le profil centralisera progressivement vos entretiens, vos analyses et les rapports
                utiles a votre suivi.
              </p>

              <div className="mt-4">
                <span className="student-profile-badge-dark">Rapport PDF actif</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}