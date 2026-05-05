import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'

function formatAnalysisDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function StudentAnalysesPage() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

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
        title="Mes analyses"
        description="Consulte vos analyses de personnalite, leurs resumes et vos rapports PDF."
      />

      <div className="mindly-stack-lg">
        <section className="mindly-card p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[var(--mindly-text-strong)]">
              {latestAnalysis ? 'Derniere analyse disponible' : 'Aucune analyse disponible'}
            </h2>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <span
              className={
                latestAnalysis ? 'mindly-ui-badge mindly-ui-badge-success' : 'mindly-ui-badge'
              }
            >
              {latestAnalysis ? 'Disponible' : 'En attente'}
            </span>

            <span className="mindly-ui-badge">
              {analyses.totalDocs} analyse{analyses.totalDocs > 1 ? 's' : ''}
            </span>
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
              Les analyses IA apparaitront ici automatiquement apres un entretien termine et une
              sauvegarde reussie.
            </p>
          )}
        </section>

        <section className="mindly-card-soft p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">
              Historique des analyses
            </h2>
          </div>

          <div className="mindly-stack-md">
            {analyses.docs.length > 0 ? (
              analyses.docs.map((analyse) => (
                <article
                  key={analyse.id}
                  className="flex flex-col gap-3 rounded-[var(--mindly-radius-md)] border border-[var(--mindly-border)] bg-white p-4 shadow-[var(--mindly-shadow-xs)] md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--mindly-text-strong)]">
                      {analyse.reference}
                    </p>

                    <p className="mt-1 text-sm text-[var(--mindly-text-soft)]">
                      {formatAnalysisDate(analyse.date)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--mindly-text-soft)]">
                      {analyse.overview || analyse.conclusion || 'Resume non disponible.'}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap gap-3">
                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      className="mindly-btn mindly-btn-secondary"
                    >
                      Ouvrir
                    </Link>

                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      target="_blank"
                      className="mindly-btn mindly-btn-primary"
                    >
                      PDF
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="mindly-empty">
                <p className="mindly-empty-title">Aucun historique pour le moment.</p>
                <p className="mindly-empty-description">
                  L'historique complet s'affichera ici des que plusieurs entretiens auront ete
                  enregistres.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}