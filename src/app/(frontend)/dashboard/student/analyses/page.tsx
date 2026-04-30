import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-dream-heading dark:text-foreground">
              {latestAnalysis ? 'Derniere analyse disponible' : 'Aucune analyse disponible'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                {latestAnalysis ? 'Disponible' : 'En attente'}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-foreground dark:text-background">
                {analyses.totalDocs} analyse{analyses.totalDocs > 1 ? 's' : ''}
              </span>
            </div>

            {latestAnalysis ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]">
                  <p className="text-sm font-semibold text-dream-heading dark:text-foreground">
                    {latestAnalysis.reference}
                  </p>
                  <p className="mt-1 text-sm text-[#7A6A99] dark:text-muted-foreground">
                    Generee le {formatAnalysisDate(latestAnalysis.date)}
                  </p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-dream-muted dark:text-muted-foreground">
                    {latestAnalysis.overview ||
                      latestAnalysis.conclusion ||
                      'Resume non disponible.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
                  >
                    Voir le rapport
                  </Link>
                  <Link
                    href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                    target="_blank"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-foreground dark:text-background"
                  >
                    Telecharger en PDF
                  </Link>
                </div>
              </div>
            ) : (
              <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                Les analyses IA apparaitront ici automatiquement apres un entretien termine et une
                sauvegarde reussie.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-dream-heading dark:text-foreground">
              Historique des analyses
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {analyses.docs.length > 0 ? (
              analyses.docs.map((analyse) => (
                <div
                  key={analyse.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.06] md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-dream-heading dark:text-foreground">
                      {analyse.reference}
                    </p>
                    <p className="mt-1 text-sm text-[#7A6A99] dark:text-muted-foreground">
                      {formatAnalysisDate(analyse.date)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-dream-muted dark:text-muted-foreground">
                      {analyse.overview || analyse.conclusion || 'Resume non disponible.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
                    >
                      Ouvrir
                    </Link>
                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      target="_blank"
                      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-foreground dark:text-background"
                    >
                      PDF
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                L'historique complet s'affichera ici des que plusieurs entretiens auront ete
                enregistres.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
