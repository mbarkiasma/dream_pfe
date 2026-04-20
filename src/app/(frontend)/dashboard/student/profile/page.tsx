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
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-[#2d1068]">Informations personnelles</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-[#6E628F]">
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
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  Profil étudiant connecté
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Mes analyses en PDF</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {analyses.docs.length > 0 ? (
                analyses.docs.map((analyse) => (
                  <div
                    key={analyse.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2d1068]">{analyse.reference}</p>
                      <p className="mt-1 text-sm text-[#7A6A99]">
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
                  <p className="text-sm text-[#6E628F]">
                    Aucune analyse n’est encore disponible. Dès qu’un entretien est terminé, un
                    rapport PDF apparaîtra ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Rapports disponibles</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Chaque entretien terminé peut maintenant être consulté et exporté en PDF depuis ce
                profil.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  {analyses.docs.length} rapport{analyses.docs.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Progression</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
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
