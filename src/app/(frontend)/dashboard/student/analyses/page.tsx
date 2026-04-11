import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        description="Consulte vos analyses de personnalité, leurs résumés et vos rapports PDF."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-slate-800">
              {latestAnalysis ? 'Dernière analyse disponible' : 'Aucune analyse disponible'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {latestAnalysis ? 'Disponible' : 'En attente'}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                {analyses.totalDocs} analyse{analyses.totalDocs > 1 ? 's' : ''}
              </span>
            </div>

            {latestAnalysis ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">{latestAnalysis.reference}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Générée le{' '}
                    {new Date(latestAnalysis.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {latestAnalysis.overview || latestAnalysis.conclusion || 'Résumé non disponible.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Voir le rapport
                  </Link>
                  <Link
                    href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                    target="_blank"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Télécharger en PDF
                  </Link>
                </div>
              </div>
            ) : (
              <p className="leading-7 text-slate-600">
                Les analyses IA apparaîtront ici automatiquement après un entretien terminé et une
                sauvegarde réussie.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-slate-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-800">Historique des analyses</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {analyses.docs.length > 0 ? (
              analyses.docs.map((analyse) => (
                <div
                  key={analyse.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{analyse.reference}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(analyse.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {analyse.overview || analyse.conclusion || 'Résumé non disponible.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Ouvrir
                    </Link>
                    <Link
                      href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                      target="_blank"
                      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      PDF
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="leading-7 text-slate-600">
                L’historique complet s’affichera ici dès que plusieurs entretiens auront été
                enregistrés.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
