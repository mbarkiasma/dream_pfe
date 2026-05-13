import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Mail, UserRound } from 'lucide-react'

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
  const displayName = getDisplayName(user)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

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
        limit: 1,
      })
    : { docs: [] }
  const activeReport = analyses.docs[0]

  return (
    <div>
      <StudentTopbar
        title="Mon profil"
        description="Consultez vos informations generales et votre rapport d'analyse."
      />

      <div className="student-profile-grid">
        <div className="student-profile-main">
          <Card className="student-profile-card overflow-hidden border-white/80 shadow-dream-card-lg dark:border-white/10">
            <CardHeader className="student-profile-card-header border-b border-border/70 bg-white/80 backdrop-blur dark:bg-white/[0.04]">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[30px] bg-[var(--mindly-primary)] text-3xl font-black text-white shadow-dream-card-lg ring-8 ring-violet-100/70 dark:ring-white/10">
                    {initials || <UserRound className="h-8 w-8" />}
                  </div>
                  <div>
                    <p className="student-profile-label">Profil etudiant</p>
                    <CardTitle className="mt-2 text-3xl font-black text-dream-heading dark:text-white">
                      {displayName}
                    </CardTitle>
                    <p className="mt-2 flex items-center gap-2 text-sm text-dream-muted dark:text-white/65">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="break-all">{user?.email || 'Non renseigne'}</span>
                    </p>
                  </div>
                </div>

                <span className="student-profile-badge self-start md:self-center">
                  Compte actif
                </span>
              </div>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                <div className="student-profile-info-grid">
                  <div className="student-profile-info-box">
                    <p className="student-profile-label">Nom complet</p>
                    <p className="student-profile-value">{displayName}</p>
                  </div>

                  <div className="student-profile-info-box">
                    <p className="student-profile-label">Email</p>
                    <p className="student-profile-value">{user?.email || 'Non renseigne'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">Mon rapport en PDF</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                {activeReport ? (
                  <div className="student-profile-analysis-row">
                    <div>
                      <p className="student-profile-analysis-title">{activeReport.reference}</p>
                      <p className="student-profile-analysis-date">
                        Genere le {formatAnalysisDate(activeReport.date)}
                      </p>
                    </div>

                    <div className="student-profile-actions">
                      <Link
                        href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                        className="student-profile-link-secondary"
                      >
                        Voir le rapport
                      </Link>

                      <Link
                        href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                        target="_blank"
                        className="student-profile-link-primary"
                      >
                        Telecharger en PDF
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="student-profile-empty">
                    <p className="student-profile-text">
                      Aucun rapport n&apos;est encore disponible. Des que votre analyse est prete, le
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
              <CardTitle className="student-profile-title">Rapport disponible</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content-compact">
              <p className="student-profile-text">
                Votre rapport d&apos;analyse est centralise dans cet espace et peut etre consulte ou
                exporte en PDF.
              </p>

              <div className="mt-4">
                <span className="student-profile-badge">
                  {activeReport ? '1 rapport' : 'Aucun rapport'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
