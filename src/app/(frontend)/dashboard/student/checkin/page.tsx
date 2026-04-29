import { Activity, Moon, SmilePlus } from 'lucide-react'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const dailySignals = [
  { icon: SmilePlus, label: 'Humeur', value: '--' },
  { icon: Moon, label: 'Sommeil', value: '--' },
  { icon: Activity, label: 'Stress', value: '--' },
]

export default function StudentCheckinPage() {
  return (
    <div>
      <StudentTopbar
        title="Suivi quotidien"
        description="Renseignez votre etat du jour pour suivre votre bien-etre au fil du temps."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Etat du jour
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {dailySignals.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05]"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm text-[#7A6A99] dark:text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#2d1068] dark:text-foreground">
                        {item.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                Cette page affichera plus tard les informations quotidiennes saisies par l'etudiant
                afin d'assurer un suivi simple de son etat emotionnel.
              </p>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                  Donnees dynamiques
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Historique
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                L'historique des check-ins quotidiens apparaitra ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                  Aucun historique
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                Observation
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                Cette section permettra plus tard d'afficher une synthese simple de l'evolution de
                l'humeur, du sommeil et du niveau de stress.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
