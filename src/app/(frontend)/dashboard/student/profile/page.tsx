import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StudentProfilePage() {
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
        limit: 5,
      })
    : { docs: [] }

  return (
    <div>
      <StudentTopbar
        title="Mon profil"
        description="Consulte vos informations générales, vos objectifs et vos rapports d’analyse."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-800">Informations personnelles</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-slate-600">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Nom
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700">
                    {user?.email ? user.email.split('@')[0] : 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700">
                    {user?.email || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Profil étudiant connecté
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Mes analyses en PDF</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {analyses.docs.length > 0 ? (
                analyses.docs.map((analyse) => (
                  <div
                    key={analyse.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{analyse.reference}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Générée le{' '}
                        {new Date(analyse.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Voir le rapport
                      </Link>

                      <Link
                        href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                        target="_blank"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Télécharger en PDF
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-600">
                    Aucune analyse n’est encore disponible. Dès qu’un entretien est terminé, un
                    rapport PDF apparaîtra ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Rapports disponibles</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Chaque entretien terminé peut maintenant être consulté et exporté en PDF depuis ce
                profil.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {analyses.docs.length} rapport{analyses.docs.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-slate-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Progression</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Le profil centralisera progressivement vos entretiens, vos analyses et les rapports
                utiles à votre suivi.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                  Rapport PDF actif
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
