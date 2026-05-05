import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentStatsCards } from '@/components/dashboard/student/StudentStatsCards'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import config from '@payload-config'
import { BarChart3, CalendarDays, ChevronRight, MoonStar } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function StudentDashboardPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  const [dreamsResult, analysesResult, latestDreamResult, latestAnalysisResult] = await Promise.all(
    [
      payload.count({
        collection: 'dreams',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
      }),
      payload.count({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
      }),
      payload.find({
        collection: 'dreams',
        user,
        overrideAccess: false,
        depth: 0,
        limit: 1,
        sort: '-createdAt',
        where: {
          user: {
            equals: user.id,
          },
        },
        select: {
          createdAt: true,
          description: true,
          summary: true,
          videoStatus: true,
        },
      }),
      payload.find({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        depth: 0,
        limit: 1,
        sort: '-date',
        where: {
          user: {
            equals: user.id,
          },
        },
        select: {
          date: true,
          niveauConfiance: true,
          overview: true,
          reference: true,
        },
      }),
    ],
  )

  const latestDream = latestDreamResult.docs[0]
  const latestAnalysis = latestAnalysisResult.docs[0]

  return (
    <div>
      <StudentTopbar
        title="Dashboard Etudiant"
        description="Bienvenue dans votre espace personnel de suivi des reves, des analyses et des rendez-vous."
      />

      <StudentStatsCards
        analysesCount={analysesResult.totalDocs}
        appointmentsCount={0}
        dreamsCount={dreamsResult.totalDocs}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Link href="/dashboard/student/dreams" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <MoonStar />
                  </span>
                  <h2 className="mindly-feature-title">Mon dernier reve</h2>
                </div>

                <span className="mindly-feature-action">
                  Voir
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {latestDream ? (
                  <div className="mindly-stack-md">
                    <p className="mindly-feature-text">
                      {latestDream.summary || latestDream.description}
                    </p>
                    <span className="mindly-ui-badge">
                      Video : {latestDream.videoStatus}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">Aucun reve enregistre pour le moment.</p>
                )}
              </div>
            </article>
          </Link>
        </div>

        <div className="mindly-stack-lg">
          <Link href="/dashboard/student/analyses" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <BarChart3 />
                  </span>
                  <h2 className="mindly-feature-title">Analyse IA</h2>
                </div>

                <ChevronRight className="mindly-feature-chevron" />
              </div>

              <div className="mindly-feature-content">
                {latestAnalysis ? (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-reference">{latestAnalysis.reference}</p>
                    <p className="mindly-feature-text">
                      {latestAnalysis.overview || 'Analyse disponible dans votre espace analyses.'}
                    </p>
                    <span className="mindly-ui-badge">
                      Confiance : {latestAnalysis.niveauConfiance || 'moyen'}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">Aucune analyse generee pour le moment.</p>
                )}
              </div>
            </article>
          </Link>

          <Link href="/dashboard/student/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <CalendarDays />
                  </span>
                  <h2 className="mindly-feature-title">Prochain rendez-vous</h2>
                </div>

                <ChevronRight className="mindly-feature-chevron" />
              </div>

              <div className="mindly-feature-content">
                <p className="mindly-feature-text">Aucun rendez-vous planifie pour le moment.</p>
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  )
}