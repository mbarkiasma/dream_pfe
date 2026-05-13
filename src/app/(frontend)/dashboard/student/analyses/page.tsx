import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

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

  return (
    <div>
      <StudentTopbar
        title="Mon rapport d'entretien"
        description="Retrouvez le resume de votre entretien, les points principaux identifies et votre rapport PDF."
      />

      <div className="mindly-stack-lg">
        <section className="mindly-card p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[var(--mindly-text-strong)]">
              {latestAnalysis ? 'Rapport disponible' : 'Rapport en attente'}
            </h2>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={
                latestAnalysis ? 'mindly-ui-badge mindly-ui-badge-success' : 'mindly-ui-badge'
              }
            >
              {latestAnalysis ? 'Entretien termine' : 'En attente'}
            </span>

            <span className="mindly-ui-badge">Rapport unique</span>
          </div>

          {latestAnalysis ? (
            <div className="mindly-stack-md">
              <div className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5">
                <p className="text-sm font-bold text-[var(--mindly-text-strong)]">
                  {latestAnalysis.reference}
                </p>

                <p className="mt-1 text-sm text-[var(--mindly-text-soft)]">
                  Generee le {formatAnalysisDate(latestAnalysis.date)}
                </p>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)]">
                  {latestAnalysis.overview ||
                    latestAnalysis.conclusion ||
                    'Resume non disponible.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  className="mindly-btn mindly-btn-secondary"
                >
                  Voir le rapport
                </Link>

                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  target="_blank"
                  className="mindly-btn mindly-btn-primary"
                >
                  Telecharger en PDF
                </Link>
              </div>
            </div>
          ) : (
            <p className="leading-7 text-[var(--mindly-text-soft)]">
              Votre rapport apparaitra ici automatiquement apres la fin de votre entretien unique.
            </p>
          )}
        </section>

        <section className="mindly-card-soft p-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">
              A propos de ce rapport
            </h2>
            <p className="mt-4 leading-7 text-[var(--mindly-text-soft)]">
              Ce rapport est genere a partir de votre entretien unique. Il sert de synthese
              personnelle et peut etre consulte a tout moment depuis cet espace.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
