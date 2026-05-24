import Link from 'next/link'
import { ArrowRight, Download, FileText } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'

function formatAnalysisDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function StudentAnalysesPage() {
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
        limit: 20,
      })
    : { docs: [], totalDocs: 0 }

  const latestAnalysis = analyses.docs[0]
  const reportWellbeing = getReportWellbeingTheme(latestAnalysis?.traits)

  return (
    <div>
      <StudentTopbar
        title="Mon rapport d'entretien"
        description="Retrouvez le résumé de votre entretien, les points principaux identifiés et votre rapport PDF."
      />

      <div className="mindly-stack-lg">
        <section
          className={`mindly-card report-theme-card report-overview-card report-theme-${reportWellbeing.theme} p-6`}
        >
          <div className="report-overview-head">
            <div>
              <p className="report-overview-kicker">Synthèse personnelle</p>
              <h2 className="report-overview-title">
                {latestAnalysis ? 'Rapport disponible' : 'Rapport en attente'}
              </h2>
            </div>

            <div className="report-overview-badges">
              <span
                className={
                  latestAnalysis ? 'mindly-ui-badge mindly-ui-badge-success' : 'mindly-ui-badge'
                }
              >
                {latestAnalysis ? 'Entretien terminé' : 'En attente'}
              </span>

              <span className="mindly-ui-badge">Rapport unique</span>
            </div>
          </div>

          {latestAnalysis ? (
            <div className="report-overview-body">
              <div className="report-summary-card">
                <div className="report-summary-top">
                  <div>
                    <p className="report-reference">{latestAnalysis.reference}</p>

                    <p className="report-date">Généré le {formatAnalysisDate(latestAnalysis.date)}</p>
                  </div>

                  <div className="report-wellbeing-pill">
                    <span>{reportWellbeing.label}</span>
                    {reportWellbeing.score !== null ? (
                      <strong>{reportWellbeing.score.toFixed(1)}/10</strong>
                    ) : null}
                  </div>
                </div>

                <div className="report-summary-grid">
                  <div>
                    <p className="report-mini-label">Vue d&apos;ensemble</p>
                    <p className="report-summary-text">
                      {latestAnalysis.overview ||
                        latestAnalysis.conclusion ||
                        'Résumé non disponible.'}
                    </p>
                  </div>

                  <div>
                    <p className="report-mini-label">Indice d&apos;équilibre</p>
                    <p className="report-summary-text">{reportWellbeing.description}</p>
                  </div>
                </div>
              </div>

              <div className="report-action-row">
                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  className="report-action-secondary"
                >
                  <FileText className="h-4 w-4" />
                  Voir le rapport
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  target="_blank"
                  className="report-action-primary"
                >
                  <Download className="h-4 w-4" />
                  Télécharger en PDF
                </Link>
              </div>
            </div>
          ) : (
            <p className="leading-7 text-[var(--mindly-text-soft)]">
              Votre rapport apparaîtra ici automatiquement après la fin de votre entretien unique.
            </p>
          )}
        </section>

        <section className="mindly-card-soft p-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">
              À propos de ce rapport
            </h2>
            <p className="mt-4 leading-7 text-[var(--mindly-text-soft)]">
              Ce rapport est généré à partir de votre entretien unique. Il sert de synthèse
              personnelle et peut être consulté à tout moment depuis cet espace.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
