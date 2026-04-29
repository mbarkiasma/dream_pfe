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

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-[#2d1068] dark:text-foreground">
                Informations personnelles
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-[#6E628F] dark:text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">
                    Nom
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700 dark:text-foreground">
                    {getDisplayName(user)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-700 dark:text-foreground">
                    {user?.email || 'Non renseigne'}
                  </p>
                </div>
              </div>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                  Profil etudiant connecte
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Mes analyses en PDF
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {analyses.docs.length > 0 ? (
                analyses.docs.map((analyse) => (
                  <div
                    key={analyse.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05] md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2d1068] dark:text-foreground">
                        {analyse.reference}
                      </p>
                      <p className="mt-1 text-sm text-[#7A6A99] dark:text-muted-foreground">
                        Generee le {formatAnalysisDate(analyse.date)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
                      >
                        Voir le rapport
                      </Link>

                      <Link
                        href={`/dashboard/student/analyses/${analyse.id}/pdf`}
                        target="_blank"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-foreground dark:text-background"
                      >
                        Telecharger en PDF
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm text-[#6E628F] dark:text-muted-foreground">
                    Aucune analyse n'est encore disponible. Des qu'un entretien est termine, un
                    rapport PDF apparaitra ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Rapports disponibles
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                Chaque entretien termine peut maintenant etre consulte et exporte en PDF depuis ce
                profil.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                  {analyses.docs.length} rapport{analyses.docs.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Progression
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                Le profil centralisera progressivement vos entretiens, vos analyses et les rapports
                utiles a votre suivi.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-foreground dark:text-background">
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
